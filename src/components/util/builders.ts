import { CNodeManager } from "@src/manager";
import type { CNodeNodeSpecType, CNodeSpecType } from "@src/types";
import { makeAsPlaceholders, makeAsTextCNodes, purifyDSL } from "./common";
import { asElement, isElementSpecType } from "domlib";
import { GenericCNode, type GenericCNodeDSLType } from "../GenericCNode";
import { AbstractCNode } from "../AbstractCNode";
import { PlaceholderStub, TextCNodeStub } from "../stubs";

export function  buildGenericCNode(... args: GenericCNodeDSLType) : GenericCNode {
  const [params, spec] = (args.length > 1 ? args : [{}, ... args]) as [Object, CNodeSpecType];
  const manager = CNodeManager.getCurrentManager() as CNodeManager;
  const name    = 'string' === typeof params ? params : (params as {name: string}).name ?? null;
  const [elementSpec, rawChildren, rawTextCNodes] = purifyDSL(manager, spec);
  if( !isElementSpecType(elementSpec) ){
    throw new Error(`malformed element spec: '${elementSpec}'`);
  }
  const element      = asElement(manager.document, elementSpec);
  const placeholders = makeAsPlaceholders(manager, element, rawChildren);
  const textCNodes   = makeAsTextCNodes(manager, element, rawTextCNodes);
  return new GenericCNode({
     manager,
     name,
     placeholders,
     textCNodes,
     element
   });
 }


export function buildCNodeFragment(manager: CNodeManager, ... args: CNodeNodeSpecType[]):AbstractCNode[]{
  return args.map((spec)=>{
    if('string' === typeof spec) return new GenericCNode({
      manager, element: asElement(manager.document, ['span', spec]), placeholders: {}, textCNodes: {} });
    if(Array.isArray(spec)) return buildGenericCNode( spec );
    if(spec instanceof AbstractCNode) return spec;
    if(spec instanceof PlaceholderStub){
      const {begin, end} = manager.makePlaceholderMarkers(spec.name);
      return spec.build(manager, begin, end);
    }
    if(spec instanceof TextCNodeStub){
      return spec.build(manager, spec.makeElement(manager));
    }
    throw new Error();
  });
}
