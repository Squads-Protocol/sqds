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
  it("pulls SOL balance for squad from treasury account", async function () {
    const squad = await Squads.mainnet().getSquad(
      new PublicKey("91RVTZF6Qvfr1TaVQFGZjMhNTw7xeVbYkkB8crpHFfyS")
    );
    expect(squad.solBalance === 0.005);
  });
  it("pulls mint account info for squad", async function () {
    const squad = await Squads.mainnet().getSquad(
      new PublicKey("91RVTZF6Qvfr1TaVQFGZjMhNTw7xeVbYkkB8crpHFfyS")
    );
    expect(squad.mint.supply === BigInt(120000));
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
    expect(squadMember.tokenAccountData.amount === BigInt(20000));
  });
});
