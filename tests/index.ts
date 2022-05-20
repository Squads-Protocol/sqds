import Squads from "@sqds/squads";
import { PublicKey } from "@solana/web3.js";
import { assert, expect } from "chai";

describe("Squads", function () {
  it("fetches a squad from mainnet", async function () {
    const squad = await Squads.mainnet().getSquad(
      new PublicKey("91RVTZF6Qvfr1TaVQFGZjMhNTw7xeVbYkkB8crpHFfyS")
    );
    expect(squad.randomId === "eE2NDxrlqH");
  });
  it("checks membership in squad", async function () {
    const squad = await Squads.mainnet().getSquad(
      new PublicKey("91RVTZF6Qvfr1TaVQFGZjMhNTw7xeVbYkkB8crpHFfyS")
    );
    assert(
      squad.hasMember(
        new PublicKey("7RvgFAdNDibFxnNuquea3LHdmtZ5gbupwNA6UvP6kXWQ")
      )
    );
  });
});
