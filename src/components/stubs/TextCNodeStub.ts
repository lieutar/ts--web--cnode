import { TextCNode, type TextCNodeDSLOptType, type TextCNodeStubParamsType } from "../TextCNode";
import { asElement, type AttributeSpecType, type ElementSpecType } from "domlib";
import { AbstractComponentStub } from "./AbstractComponentStub";
import { CNodeManager } from "@src/manager";

export class TextCNodeStub extends AbstractComponentStub{

  //get __brand_ITextCNodeStub(){ return true as true; }

  get id(){ return (this._params as TextCNodeStubParamsType).id; }
  //makeElement(manager:ICNodeManager){ return asElement( manager.document, this.dsl ) }
  makeElement(manager:CNodeManager){ return asElement( manager.document, this.dsl ) }

  constructor(params: TextCNodeStubParamsType){ super(params); }

  get dsl():ElementSpecType{
    const params = this._params as TextCNodeStubParamsType;
    const tagName = params.tagName ?? 'span';
    const attributes = { ... (params.attributes ?? {}), 'data-cnode-id':this.id}  as AttributeSpecType;
    return [tagName, attributes]; }

  //build(manager: ICNodeManager, container:Element): TextCNode{
  build(manager: CNodeManager, element:Element): TextCNode{
    return new TextCNode({... this._params, element, manager}); }

  static build<T extends typeof TextCNodeStub>(this: T, name:string, params?:TextCNodeDSLOptType):TextCNodeStub{
    const manager = CNodeManager.getCurrentManager();
    const id = manager.gensym();
    const params_ = {... (params ?? {}), name, id};
    return new this(params_); }
}
