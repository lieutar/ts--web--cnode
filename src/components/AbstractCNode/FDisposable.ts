import type { Constructor } from "@looper-utils/types";
import { Feature, fMixinTools, type IFeatureClass } from "qoop";

export interface IDisposable {
get isAvailable(): boolean;
requiresAlive(): void;
dispose(): Promise<void>;
}

export class Disposable extends Feature(){
  static applyFeature(Base: Constructor){

    const {self, d} = fMixinTools(Disposable as IFeatureClass<IDisposable>);
    return class extends Base{

      get isAvailable(){ return self(this).isAvailable; }

      requiresAlive = d('requiresAlive') as ()=>void;
      dispose = d('dispose') as ()=>Promise<void>;

      constructor(... args:any[]){
        super(...args);
        new Disposable().inject(this);
      }
    }
  }

  private _isAvailable: boolean = true;

  get isAvailable(){ return this._isAvailable; }

  requiresAlive(){
    if(!this.isAvailable) throw new Error( `Dead component` ); }

  async dispose(){
    await this.owner.assertAvailable();
    await this.owner.purgeManagedNodesFromParent();
    this._isAvailable = false; }

}

export const FDisposable = Disposable as IFeatureClass<IDisposable>;
