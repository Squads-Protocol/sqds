import Squads from "@sqds/squads-local";
import { PublicKey } from "@solana/web3.js";
import { assert, expect } from "chai";

describe("Squads", function () {
  it("fetches a squad from mainnet", async function () {
    const squad = await Squads.mainnet().getSquad(
      new PublicKey("91RVTZF6Qvfr1TaVQFGZjMhNTw7xeVbYkkB8crpHFfyS")
    );
    expect(squad.randomId).to.equal("eE2NDxrlqH");
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
  it("pulls SOL balance for squad from treasury account", async function () {
    const squad = await Squads.mainnet().getSquad(
      new PublicKey("91RVTZF6Qvfr1TaVQFGZjMhNTw7xeVbYkkB8crpHFfyS")
    );
    expect(squad.solBalance).to.equal(0.005);
  });
  it("pulls mint account info for squad", async function () {
    const squad = await Squads.mainnet().getSquad(
      new PublicKey("91RVTZF6Qvfr1TaVQFGZjMhNTw7xeVbYkkB8crpHFfyS")
    );
    expect(squad.mint.supply).to.equal(BigInt(120000));
  });
  it("pulls equity token account info for members", async function () {
    const squad = await Squads.mainnet().getSquad(
      new PublicKey("91RVTZF6Qvfr1TaVQFGZjMhNTw7xeVbYkkB8crpHFfyS")
    );
    const squadMember = squad.members.find((member) =>
      member.publicKey.equals(
        new PublicKey("7RvgFAdNDibFxnNuquea3LHdmtZ5gbupwNA6UvP6kXWQ")
      )
    );
    expect(squadMember.tokenAccountData.amount).to.equal(BigInt(20000));
  });
  it("pulls multiple squads at once", async function () {
    const squads = await Squads.devnet();
    const squad1 = new PublicKey(
      "GuqKt3p43GV8Gzxx8U1uNZiSTYSAxAYjT4GPcZ91bArJ"
    );
    const squad2 = new PublicKey(
      "FuUZ6YVK8g5743FwjF1Dbw3yknrbHPPxhxo35ikw89xq"
    );
    const squadsData = await squads.getSquads([squad1, squad2]);
    expect(squadsData[0].randomId).to.equal("bAjOtzMUdp");
    expect(squadsData[1].randomId).to.equal("jXweyhvp3R");
  });
  it("can be constructed toward custom endpoint", async function () {
    const squads = await Squads.endpoint("https://api.devnet.solana.com");
    const squad = await squads.getSquad(
      new PublicKey("GuqKt3p43GV8Gzxx8U1uNZiSTYSAxAYjT4GPcZ91bArJ")
    );
    expect(squad.randomId).to.equal("bAjOtzMUdp");
  });
});
