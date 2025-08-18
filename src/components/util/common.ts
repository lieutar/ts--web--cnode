import { isAttrSpecType, isCommentSpecType, isElementNode, isTextSpecType, type AttributeSpecType,
  type FragmentSpecType, type NodeSpecType } from "domlib";
import { isICNodeDSLComponentNode, type CNodeNodeSpecType, type CNodeSpecType, } from "../../types";
import { Placeholder } from "../Placeholder";
import { PlaceholderStub, TextCNodeStub } from "../stubs";
import type { CNodeManager } from "../../manager";
import type { PlaceholderDictType, TextCNodeDictType } from "../GenericCNode";
import type { AbstractCNode } from "../AbstractCNode";

type TextCNodeStubDictType = {[name:string]: TextCNodeStub[]}
type ChildDictType = {[name:string]:AbstractCNode};

export function purifyDSL(manager: CNodeManager, src: CNodeSpecType
):[NodeSpecType, ChildDictType, TextCNodeStubDictType]{
  if(isTextSpecType(src)   ||
    isCommentSpecType(src) ||
    isElementNode(src)     ) return [ src, {}, {} ];
  const [ elementName, attrs, content ]  = isAttrSpecType( src[1] ) ?
    [ src[0], src[1],                  src.slice(2) as NodeSpecType[] ]:
    [ src[0], {} as AttributeSpecType, src.slice(1) as NodeSpecType[] ];
  const [newContent, children, tnd] = purifyDSLFragment( manager, content );
  return [[elementName, attrs, ... newContent], children, tnd];
}

function purifyNode(manager: CNodeManager, c: CNodeNodeSpecType
):[NodeSpecType[], ChildDictType, TextCNodeStubDictType]{

  if(!isICNodeDSLComponentNode(c)){
    const [sp, dict, tnd] = purifyDSL(manager, c as CNodeSpecType);
    return [[sp], dict, tnd];
  }

  if(c instanceof TextCNodeStub){
    return [[c.makeElement(manager) as NodeSpecType], {} , {[c.name]: [c]}];
  }else{
    const {begin, end} = manager.makePlaceholderMarkers(c.name);
    return [[begin, end] as NodeSpecType[], {[c.name]: c} as ChildDictType, {}];
  }
}

function purifyDSLFragment(manager: CNodeManager, src: CNodeNodeSpecType[]
):[FragmentSpecType, ChildDictType, TextCNodeStubDictType]{
  const dst = [];
  const childDict : {[name: string]:AbstractCNode} = {};
  const tnDict : TextCNodeStubDictType = {};
  for( const c of src ){
    const [nodes, dict, tnd] = purifyNode(manager, c);
    for(const [name, child] of Object.entries(dict))
      childDict[name] = child;
    for(const [name, tn] of Object.entries(tnd))
      tnDict[name] = [ ... ( tnDict[name] ?? []), ... tn ];
    dst.push(... nodes);
  }
  return [dst, childDict, tnDict];
}

export function makeAsPlaceholders(
  manager: CNodeManager, element: Element, rawChildren: ChildDictType ): PlaceholderDictType
{
  const phs : {[key:string]:Element} = {};
  for(const ph of element.querySelectorAll('script[type="application/x-cnode-ph-begin"]')){
    const name = ph.getAttribute('name')!;
    phs[name] = ph;
  }

  const pdict: PlaceholderDictType = {};
  for(const [name, child] of Object.entries(rawChildren)){
    const begin = phs[name]!;
    const end   = begin.nextSibling!;
    const ph:Placeholder | null = (()=>{
      if(child instanceof PlaceholderStub) return child.build(manager, begin, end);
      return new Placeholder({manager, name, contents: [child], begin, end, });
    })();
    if(ph) pdict[name] = ph;
  }
  return pdict;
}

export function makeAsTextCNodes(
  manager:CNodeManager, container: Element, src: TextCNodeStubDictType
) : TextCNodeDictType {
  const R: TextCNodeDictType = {};
  for( const [name, stubs] of Object.entries( src ) ){
    R[name] = stubs.map((s)=>{
      const element = container.querySelector(`[data-cnode-id="${s.id}"]`)!;
      return s.build(manager, element);
    } );
  }
  return R;
}
