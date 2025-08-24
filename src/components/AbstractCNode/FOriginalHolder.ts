import type { Constructor } from "@looper-utils/types";
import { Feature, fMixinTools, type IFeatureClass } from "qoop";
import type { AbstractCNode } from ".";

export interface IOriginalHolder {
get original(): AbstractCNode;
setOriginal(original:AbstractCNode): void;
}

export class OriginalHolder extends Feature(){

  static applyFeature(Base: Constructor){
    const {self, d} = fMixinTools(OriginalHolder as IFeatureClass);
    return class extends Base{
      get original(){ return self(this).original as AbstractCNode; }
      setOriginal = d('setOriginal') as (original: AbstractCNode)=>void;
      constructor(... args:any[]){
        super(... args);
        new OriginalHolder().inject(this);
      }
    };
  }

  private _original: AbstractCNode| null = null;
  get original(){ return this._original ?? this.owner; }
  setOriginal(original: AbstractCNode){ this._original = original; }

}


export const FOriginalHolder = OriginalHolder as IFeatureClass<IOriginalHolder>;
