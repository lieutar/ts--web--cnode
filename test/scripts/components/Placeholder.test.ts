import type { GenericCNode } from "@src/components";
import { makeDataRemover, makeManager } from "@test-lib/*";
import { describe } from "vitest";

describe('Placeholder', ()=>{
  const man = makeManager();
  const trim = makeDataRemover(man.window);
  const gen = man.create(({c,$$})=>c(['div',])) as GenericCNode;

});
