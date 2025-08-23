import { makeDataRemover, makeManager } from "@test-lib/*";
import { asDomlibDSL } from "domlib";
import { describe, expect, test } from "vitest";
import type { GenericCNode } from "@src/components";

describe('GeneticCNode', ()=>{
  const man = makeManager();
  const dataRemover = makeDataRemover(man.window);
  test('generate', async ()=>{
    const gen = man.create((({c})=>c(['div', {class: 'foo'}, 'bar'])));
    expect(asDomlibDSL(dataRemover.process((await gen.getWholeNodes()) as Element))
    ).toEqual(['DIV', {class: 'foo'}, 'bar']);
  });

  test('nested', async ()=>{
    const gen = man.create(({c})=>c(['div', c('foo',['div'])])) as GenericCNode;
    expect([... gen.placeholders].map(ph=>ph.name)).toEqual(['foo']);
  });
});
