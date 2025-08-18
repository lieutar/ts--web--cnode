import { type CNodeSpecType } from "../types";
import { AbstractCNode, type AbstractCNodeParamsType } from "./AbstractCNode";
import { ElementHolder } from "./compositions/ElementHolder";
import type { DisposeOptionsType, Placeholder } from "./Placeholder";
import type { TextCNode } from "./TextCNode";
import { buildGenericCNode } from "./util";

export type GenericCNodeParamsType = AbstractCNodeParamsType & {
  element:      Element,
  placeholders: PlaceholderDictType,
  textCNodes:   TextCNodeDictType
};

export type PlaceholderDictType = {[name:string]: Placeholder};
export type TextCNodeDictType   = {[name:string]: TextCNode[]};

export type GenericCNodeDSLType = [Object | string , CNodeSpecType] | [CNodeSpecType];

export class GenericCNode extends AbstractCNode{

  protected _parts: { eh: ElementHolder };
  get __brand_IPlaceholder(){ return true as true; }

  private _textCNodes: TextCNodeDictType;
  get textCNodes(){
    this.requiresAlive();
    return {... this._textCNodes};
  }

  private _placeholders: PlaceholderDictType;

  get placeholders(){
    this.requiresAlive();
    return Object.values(this._placeholders); }

  get children(){
    this.requiresAlive();
    return [ ...  this.placeholders.map(ph => ph.data)].flat() }

  get blankPlaceholders(){
    this.requiresAlive();
    return this.placeholders.filter(ph => !ph.hasValue);
  }

  async setChild(name: string, child: AbstractCNode, opt?: DisposeOptionsType){
    await this.assertAvailable();
    await this.setChildren(name, [child], opt);
  }

  async setChildren(name: string, children: AbstractCNode[], opt?: DisposeOptionsType){
    await this.assertAvailable();
    if(!( name in  this._placeholders)) throw new Error();
    const ph = this._placeholders[name]!;
    return ph.setEntities(children, opt);
  }

  async addChildren(name: string, ... children: AbstractCNode[]){
    await this.assertAvailable();
    if(!(name in this._placeholders)) throw new Error();
    await this._placeholders[name]!.setEntities(children);
  }

  getChildren(name: string): AbstractCNode[] | null{
    this.requiresAlive();
    const ph = this._placeholders[name];
    if(!ph) throw new Error(`undefined child: '${name}'`);
    return ph.data as AbstractCNode[] ?? null;
  }

  override async fillValues(get: (name:string)=>unknown){
    await this.assertAvailable();

    for( const [name, tns] of Object.entries(this.textCNodes)){
      const value = get(name);
      const resolved = value instanceof Promise ? await value : value;
      if(resolved === null || resolved === undefined ) continue;
      for(const tn of tns.filter(tn => !tn.hasValue)) await tn.setValue( value );
    }

    await Promise.all(this.children.map( c => {
      return c.fillValues(get) } ));
  }

  async fillComponents(get: (name:string)=>unknown){
    await this.assertAvailable();
    for( const ph of this.blankPlaceholders ){
      const filter = async (value:unknown)=>{
        if(value === null || value === undefined) return null;
        if(value instanceof AbstractCNode) return [value];
        if(Array.isArray(value)          ) return value.filter(e => e instanceof AbstractCNode);
        if(value instanceof Promise      ) return filter(await value);
        throw new Error(`Malformed components '${value}'`); };
      const frgm = await filter(get(ph.name));
      if(frgm) await ph.setEntities(frgm);
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // with _parts.eh
  get element(){ return this._parts.eh.element }
  async getWholeNodes(){ return await this._parts.eh.getWholeNodes(); }
  async getFirstNode(){ return await this._parts.eh.getFirstNode(); }
  async getLastNode(){ return await this._parts.eh.getLastNode(); }
  async purgeManagedNodesFromParent(){ await this._parts.eh.purgeManagedNodesFromParent(); }

  override async dispose(){
    await this.assertAvailable();
    for( const ph of this.placeholders ) await ph.dispose();
    await this._parts.eh.dispose();
    await super.dispose();
  }
  //////////////////////////////////////////////////////////////////////////////

  constructor(params: GenericCNodeParamsType){
    super(params);

    this._parts = {eh: new ElementHolder({ ... this._partsParams(), element: params.element })};
    this._placeholders = params.placeholders;
    this._textCNodes   = params.textCNodes;
    for(const ph of Object.values(this._placeholders)) ph.setParent(this);
  }

  static build(... args: GenericCNodeDSLType ): GenericCNode{
   return buildGenericCNode( ... args);
 }
}
