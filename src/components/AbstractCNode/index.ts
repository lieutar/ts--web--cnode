import { type ICNodeDSLComponentNode } from "../../types";
import {CNodeManager } from "../../manager";
import type { AbstractComponentPartsParamsType } from "../compositions/AbstractComponentParts";
import { Prop, QoopObject, Setter } from "qoop";
import type { PPick } from "@looper-utils/types";


export interface AbstractCNodeProps {
  id: string;
  parent: AbstractCNode | null;
  manager: CNodeManager;
  name: string;
};

export type AbstractCNodeParams = PPick<AbstractCNodeProps, 'manager'>;

export abstract class AbstractCNode extends QoopObject() implements ICNodeDSLComponentNode{

  get __brand_ICNodeDSLComponentNode(){ return true as true; }

  @Prop() declare manager: CNodeManager;
  get logger(){ return this.manager.logger; }

  @Prop() declare id: string;
  @Prop() declare name: string;
  @Prop() declare parent: AbstractCNode | null;
  @Setter('parent') setParent(_parent: AbstractCNode | null){ throw new Error(); }
  get isRoot() : boolean{
    this.requiresAlive();
    return this.parent === null; }

  get isAnonymous(){ return this._id === this._name; }

  private _original: AbstractCNode = this;
  get original(){ return this._original; }
  setOriginal(original: AbstractCNode){ this._original = original; }


  private _isAvailable: boolean = true;

  get isAvailable(){ return this._isAvailable; }

  override toString(){
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

  constructor (params: AbstractCNodeParams){
    const manager = params.manager;
    const id      = params.id ?? manager.gensym();
    const parent  =  params.parent ?? null;
    const name    = params.name ?? id;
    super({manager, id, name, parent});
  }

  abstract getWholeNodes(): Promise<Node>;
  abstract getFirstNode(): Promise<Node | null>;
  abstract getLastNode(): Promise<Node | null>;
  abstract purgeManagedNodesFromParent(): Promise<void>;

  async fillValues(_get:(key:string)=>unknown): Promise<void>{}
}
