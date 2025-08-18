import { AbstractCNode } from "./AbstractCNode";

export class NullEntityCNode extends AbstractCNode {

  async getWholeNodes(){
    await this.assertAvailable();
    return this.manager.document.createDocumentFragment(); }

  async getFirstNode(){
    await this.assertAvailable();
    return null; }

  async getLastNode(){
    await this.assertAvailable();
    return null; }

  async purgeManagedNodesFromParent(){
    await this.assertAvailable();
  }
}
