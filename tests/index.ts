import Squads from "@sqds/squads";
import { PublicKey } from "@solana/web3.js";
import { expect } from "chai";

describe("Squads", function () {
  it("fetches a squad from mainnet", async function () {
    const squad = await Squads.mainnet().getSquad(
      new PublicKey("91RVTZF6Qvfr1TaVQFGZjMhNTw7xeVbYkkB8crpHFfyS")
    );
    expect(squad.randomId === "eE2NDxrlqH");
  });
});
