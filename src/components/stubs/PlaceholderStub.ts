import { AbstractComponentStub } from "./AbstractComponentStub";
import { Placeholder, type PlaceholderDSLType, type PlaceholderStubParamsType } from "../Placeholder";
import type { CNodeManager } from "@src/manager";

export class PlaceholderStub extends AbstractComponentStub {

  get __brand_IComponentPlaceholderStub() { return true as true; }
  get filter(){ return (this._params as any).filter as Placeholder['filter'] | undefined }

  build(manager: CNodeManager, begin: Node, end: Node ):Placeholder{
    return new Placeholder({
      manager,
      name: this.name,
      filter: this.filter,
      begin,
      end
    });
  }

  constructor(params: PlaceholderStubParamsType){ super(params) }

  static build<T extends typeof PlaceholderStub>(this:T, ... args: PlaceholderDSLType):PlaceholderStub{
    const params = 'string' === typeof args[0] ? {name: args[0]} : args[0];
    return new this( params );
  }
}
