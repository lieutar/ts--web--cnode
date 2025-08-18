import { AbstractComponentParts, type AbstractComponentPartsParamsType } from "./AbstractComponentParts";

export class ElementHolder extends AbstractComponentParts<AbstractComponentPartsParamsType>{

  constructor ( params: AbstractComponentPartsParamsType & {element: Element} ){
    super(params);
    this._setElement( params.element ); }

  protected _setElement(node: Element){
    this.manager.bindComponent(this.owner, node ); }

  protected get _element(): Element | null {
    const node = this.manager.getNode(this.owner);
    return node as Element ?? null; }

  get element() {
    const node = this._element;
    if(!node) throw new Error();
    return node; }

  async getWholeNodes() {
    await this.assertAvailable();
    return this.element; }

  async getFirstNode(){
    await this.assertAvailable();
    return this.element; }

  async getLastNode(){
    await this.assertAvailable();
    return this.element; }

  async purgeManagedNodesFromParent(){
    await this.assertAvailable();
    const element = this.element;
    if(!element) return;
    const parent = element.parentElement;
    if(!parent) return;
    parent.removeChild(element); }

  async dispose() {
    await this.assertAvailable();
    await this.purgeManagedNodesFromParent();
    this.manager.unbindComponent(this.owner); }

}
