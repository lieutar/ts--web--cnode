import { type AbstractComponentStubParamsType, } from "../types";
import { AbstractCNode, type AbstractCNodeParamsType } from "./AbstractCNode";
import { PlaceholderLogic } from "./compositions/PlaceholderLogic";
import { TextCNode } from "./TextCNode";

export type PlaceholderStubParamsType = AbstractComponentStubParamsType & {
  contents?: AbstractCNode[] | null,
  filter?: Placeholder['filter']
};

export type PlaceholderDSLType  = [PlaceholderStubParamsType | string];

export type DisposeOptionsType = {keepAlive: boolean};
export const disposeOptionsDefault = {keepAlive: false};

export type PlaceholderParamsType = AbstractCNodeParamsType & {
  begin: Node,
  end: Node,
  contents?: AbstractCNode[] | null
  filter?: Placeholder['filter']
};

export class Placeholder
extends AbstractCNode{

  readonly filter: (components:AbstractCNode[]) => AbstractCNode[];

  get markers() : {begin: Node, end: Node}{
    this.requiresAlive();
    const markers = this.manager.getPlaceholderMarkers( this );
    if(!markers) throw new Error();
    return markers;
  }

  get length(): number { this.requiresAlive(); return this.data.length; }

  private async _disposeContent(old: AbstractCNode, opt?:DisposeOptionsType){
    await this.assertAvailable();
    old.setParent(null);
    await old.purgeManagedNodesFromParent();
    if((opt ?? disposeOptionsDefault).keepAlive) return [old];
    await old.dispose();
    return [];
  }

  private async _clearEntities(opt?: DisposeOptionsType): Promise<AbstractCNode[]>{
    const R:AbstractCNode[] = [];
    for(const old of this._data.splice(0, this._data.length)){
      R.push(... await this._disposeContent(old, opt));
    }
    const {begin, end} = this.markers;
    const parent = begin.parentElement;
    if(parent){
      while(begin.nextSibling && begin.nextSibling !== end){
        parent.removeChild(begin.nextSibling);
      }
    }
    return R;
  }

  private async _updateDOM(){
    const buf = this.manager.document.createDocumentFragment();
    for(const e of this._data){
      e.setParent(this);
      buf.appendChild(await e.getWholeNodes());
    }
    const {end} = this.markers;
    const parent = end.parentElement;
    if(parent) parent.insertBefore(buf, end);
  }

  async setEntities(entities?: AbstractCNode[]|null ,opt?: DisposeOptionsType):Promise<AbstractCNode[]>{
    await this.assertAvailable();
    const R = await this._clearEntities(opt);
    this._data.splice(0,0, ... this.filter(entities ?? []));
    await this._updateDOM();
    return R;
  }


  async fillValues(get: (key: string) => unknown): Promise<void> {
    await this.assertAvailable();
    await Promise.all(this.data.map(c => c.fillValues(get)));
  }
  //////////////////////////////////////////////////////////////////////////////

  async getWholeNodes(){
    await this.assertAvailable();
    const R = this.manager.document.createDocumentFragment();
    const {begin, end} = this.markers;
    let node:Node|null = begin;
    while(node){
      R.appendChild(node);
      if(node === end) break;
      node = node.nextSibling;
    }
    return R;
  }

  async getFirstNode(){
    await this.assertAvailable();
    return this.markers.begin;
  }

  async getLastNode(){
    await this.assertAvailable();
    return this.markers.end;
  }

  async dispose(){
    await this.assertAvailable();
    for( const e of this._data ) await e.dispose();
    this.manager.unbindPlaceholder(this);
    await super.dispose();
  }

  async purgeManagedNodesFromParent(){
    await this.assertAvailable();
    const {begin, end} = this.markers;
    const parent = begin.parentElement;
    if(!parent) return;
    for( const e of this.data ) await e.purgeManagedNodesFromParent();
    parent.removeChild(begin);
    parent.removeChild(end);
  }


  protected _parts: { phl: PlaceholderLogic<AbstractCNode[]> };
  //////////////////////////////////////////////////////////////////////////////
  // with _parts.phl
  private get _data(){ return this._parts.phl.data; }
  get data(){ return [... this._data]; }
  get hasValue(){ return this._parts.phl.hasValue; }
  get value(){ return this._parts.phl.value; }
  get hasDefaultValue(){ return this._parts.phl.hasDefaultValue; }
  get defaultValue(){ return this._parts.phl.defaultValue; }
  coerce(v:unknown){ return this._parts.phl.coerce(v); }
  protected _setValue(v:unknown){ this._parts.phl._setValue(v); }
  async setValue(v:unknown){ await this._parts.phl.setValue(v); }
  //////////////////////////////////////////////////////////////////////////////
  constructor(params: PlaceholderParamsType){

    super(params);

    this.filter = params.filter ?? (src => src);
    this.manager.bindPlaceholder(this, params.begin, params.end );

    const coerce = (v: unknown):AbstractCNode[] => {
      if(v === "" || v === null || v === undefined) return [];
      const recurse =  (o: unknown):AbstractCNode[] => {
        if( o instanceof AbstractCNode ) return [o];
        if( Array.isArray(o) ) return o.map( recurse ).flat();
        return [new TextCNode({
          manager: this.manager,
          element: this.manager.document.createElement('span'),
          value: o })];
      };
      return this.filter(recurse(v));
    };

    const phl = new PlaceholderLogic<AbstractCNode[]>({ ... this._partsParams(),
      coerce,
      value: params.contents,
      updateDOM: async ()=>{
        await this._updateDOM();
      }});
    this._parts = { phl };
    phl.init();
  }

}
