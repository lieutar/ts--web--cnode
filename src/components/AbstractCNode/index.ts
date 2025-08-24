import { type ICNodeDSLComponentNode } from "../../types";
import {CNodeManager } from "../../manager";
import type { AbstractComponentPartsParamsType } from "../compositions/AbstractComponentParts";
import { Prop, QoopObject, Setter, WithFeatures } from "qoop";
import type { PPick } from "@looper-utils/types";
import { FOriginalHolder } from "./FOriginalHolder";
import { FDOMBusy } from "./FDOMBusy";
import { FDisposable } from "./FDisposable";

export interface AbstractCNodeProps {
  id: string;
  parent: AbstractCNode | null;
  manager: CNodeManager;
  name: string;
};

export type AbstractCNodeParams = PPick<AbstractCNodeProps, 'manager'>;

export abstract class AbstractCNode
 extends WithFeatures( QoopObject(), FOriginalHolder, FDOMBusy, FDisposable )
 implements ICNodeDSLComponentNode
{

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

  get isAnonymous(){ return this.id === this.name; }

  override toString(){
    const name = this.name === this.id ? '' : `name="${this.name}" `;
    return `<${this.constructor.name} ${name} id="${this.id}"/>`
  }

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
