import { type ICNodeDSLComponentNode } from "../types";
import {CNodeManager } from "../manager";
import type { AbstractComponentPartsParamsType } from "./compositions/AbstractComponentParts";

export type AbstractCNodeParamsType = {
  id?: string | null,
  parent?: AbstractCNode | null,
  manager: CNodeManager,
  name?: string | null
};

export abstract class AbstractCNode implements ICNodeDSLComponentNode{

  get __brand_ICNodeDSLComponentNode(){ return true as true; }

  private _manager: CNodeManager;
  get manager(){ return this._manager as CNodeManager; }
  get logger(){ return this.manager.logger; }

  private _id: string;
  get id() { return this._id; }
  private _name: string;
  get name(){ return this._name; }

  get isAnonymous(){ return this._id === this._name; }

  private _original: AbstractCNode = this;
  get original(){ return this._original; }
  setOriginal(original: AbstractCNode){ this._original = original; }

  private _parent: AbstractCNode | null;
  get parent() : AbstractCNode | null{
    this.requiresAlive();
    return this._parent ?? null; }

  setParent(parent: AbstractCNode | null){
    this.requiresAlive();
    this._parent = parent; }

  get isRoot() : boolean{
    this.requiresAlive();
    return this.parent === null; }

  private _isAvailable: boolean = true;

  get isAvailable(){ return this._isAvailable; }

  toString(){
    const name = this.name === this.id ? '' : `name="${this.name}" `;
    return `<${this.constructor.name} ${name} id="${this.id}"/>`
  }

  protected _domReadyPromise:          Promise<void> | null = null;
  protected _domReadyPromise_resolver: (() => void)  | null = null;
  protected _domReadyPromise_rejector: ((reason?: any) => void) | null = null;

  get isDOMBusy(){ return this._domReadyPromise !== null; }

  protected _setDOMBusy(): void {
    if (this.isDOMBusy) {
      console.warn(`Component '${this.id}' is already busy.`);
      return;
    }
    this.manager.logger.tag('DOMBusy').debug(`_setDOMBusy ${this}`);
    this._domReadyPromise = new Promise((resolve, reject) => {
      this._domReadyPromise_resolver = resolve;
      this._domReadyPromise_rejector = reject;
    });
  }

  protected _resolveDOMBusy(): void {
    if (!this.isDOMBusy) {
      console.warn(`Component '${this.id}' was not busy.`);
      return;
    }
    this.manager.logger.tag('DOMBusy').debug(`_resolveDOMBusy ${this}`);
    if (this._domReadyPromise_resolver) {
      this._domReadyPromise_resolver();
      this._domReadyPromise_resolver = null;
      this._domReadyPromise_rejector = null;
    }
  }

  requiresAlive(){
    if(!this.isAvailable) throw new Error( `Dead component` ); }

  async assertAvailable(){
    this.requiresAlive();
    if(!this.isDOMBusy) return;
    await this._domReadyPromise;
  }

  async dispose(){
    await this.assertAvailable();
    await this.purgeManagedNodesFromParent();
    this._isAvailable = false; }

  protected _partsParams(): AbstractComponentPartsParamsType{
    return {
      owner:           this,
      setDOMBusy:      ()=> this._setDOMBusy(),
      resolveDOMBusy:  ()=> this._resolveDOMBusy(),
      requiresAlive:   ()=>this.requiresAlive(),
      assertAvailable: async ()=>await this.assertAvailable() }; }

  constructor (params: AbstractCNodeParamsType){
    this._parent   = params.parent ?? null;
    this._manager  = params.manager as CNodeManager;
    this._id       = params.id   ?? params.manager.gensym();
    this._name     = params.name ?? this._id;
  }

  abstract getWholeNodes(): Promise<Node>;
  abstract getFirstNode(): Promise<Node | null>;
  abstract getLastNode(): Promise<Node | null>;
  abstract purgeManagedNodesFromParent(): Promise<void>;

  async fillValues(_get:(key:string)=>unknown): Promise<void>{}
}
