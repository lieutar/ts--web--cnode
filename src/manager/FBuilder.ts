import { AbstractCNode, GenericCNode, PlaceholderStub, TextCNodeStub, type GenericCNodeDSLType,
  type PlaceholderDSLType, type TextCNodeDSLType } from "../components";
import { buildCNodeFragment } from "../components/util";
import type { CNodeNodeSpecType } from "../types";
import type { CNodeManager } from "./CNodeManager";
import { Feature, type IFeatureClass } from "qoop";
import type { Constructor } from "@looper-utils/types";

export type CNodeDSLEnvType = {
  c:    (... args: GenericCNodeDSLType) => GenericCNode,
  $:    (... args: TextCNodeDSLType   ) => TextCNodeStub,
  $$:   (... args: PlaceholderDSLType ) => PlaceholderStub,
  F:    (... args: CNodeNodeSpecType[]) => AbstractCNode[],
};

//export type SctionBuilderType = (_:SectionDSLType)=>Section;
export type CNodeComponentBuilderType = (_:CNodeDSLEnvType)=>AbstractCNode;
export type CNodeFragmentBuilderType  = (_:CNodeDSLEnvType)=>AbstractCNode[];
export type CNodeTemplateBuilderType  = (_:CNodeDSLEnvType)=>GenericCNode;

function makeDSLEnv(manager:CNodeManager):CNodeDSLEnvType{
  return {
    c:   GenericCNode.build.bind(GenericCNode),
    $:   TextCNodeStub.build.bind(TextCNodeStub),
    $$:  PlaceholderStub.build.bind(PlaceholderStub),
    F: (... args: CNodeNodeSpecType[]) => buildCNodeFragment(manager, ...args )
  };
}

let currentManager : CNodeManager | null = null;
export function getCurrentManager() : CNodeManager {
  if( currentManager ) return currentManager;
  throw new Error(`currentManager isn't available now.`);
}

export function createComponentWithDSL<I extends (_:any)=>O,O>(manager: CNodeManager, cb: I): O{
  currentManager = manager;
  try{
    return cb((manager as any).dslEnv as CNodeDSLEnvType);
  }finally{
    currentManager = null;
  }
}

export interface IBuilder {
  readonly dslEnv: CNodeDSLEnvType;
  create(cb: CNodeComponentBuilderType): AbstractCNode;
  createSome(cb: CNodeFragmentBuilderType) : AbstractCNode[];
}

export class Builder extends Feature(){
  static applyFeature(Base: Constructor<CNodeManager>){
    return class extends Base{
      override readonly dslEnv:Readonly<CNodeDSLEnvType> = makeDSLEnv(this);
      override create(cb: CNodeComponentBuilderType): AbstractCNode{ return createComponentWithDSL(this, cb); }
      override createSome(cb: CNodeFragmentBuilderType) : AbstractCNode[]{ return createComponentWithDSL(this, cb); }
    }
  }
}

export const FBuilder = Builder as IFeatureClass<IBuilder>;
