import { describe, it, assert } from "vitest";
import { Gate } from "../../src/core/gate";
import { Policy } from "../../src/core/policy";

interface Rep {
  role: string;
  id: number;
  isAdmin: boolean;
  isBanned: boolean;
}

interface Entity {
  authorId: number;
}

describe("Access Control Integration Test", () => {
  it("Allows access for a user with proper guards and policies", async () => {
    const gate = new Gate();

    // Define policies
    const userPolicy = new Policy("user");
    userPolicy.define("create", (rep: Rep) => rep.role === "admin");
    userPolicy.define(
      "update",
      (rep: Rep, entity: Entity) => rep.id === entity.authorId
    );

    const postPolicy = new Policy("post");
    postPolicy.define("view", () => true); // Always allowed
    postPolicy.define(
      "edit",
      (rep: Rep, entity: Entity) => rep.id === entity.authorId
    );

    gate.addPolicy(userPolicy);
    gate.addPolicy(postPolicy);

    // Add global guards
    gate.guard((rep: Rep) => (rep.isBanned ? false : undefined));
    gate.asyncGuard(async (rep: Rep) => (rep.isAdmin ? true : undefined));

    // Define representatives
    const admin = { id: 1, role: "admin", isAdmin: true, isBanned: false };
    const regularUser = {
      id: 2,
      role: "user",
      isAdmin: false,
      isBanned: false
    };
    const bannedUser = { id: 3, role: "user", isAdmin: false, isBanned: true };

    // Test admin access
    const adminRep = await gate.buildAsync(admin);
    const adminCreateDecision = adminRep.access("user", "create");
    assert.isTrue(adminCreateDecision.can(), "Admin can create users");

    const adminViewPostDecision = adminRep.access("post", "view");
    assert.isTrue(adminViewPostDecision.can(), "Admin can view posts");

    const adminEditPostDecision = adminRep.access("post", "edit");
    assert.isTrue(
      adminEditPostDecision.can({ authorId: 1 }),
      "Admin can edit their own posts"
    );

    // Test regular user access
    const regularRep = await gate.buildAsync(regularUser);
    const regularCreateDecision = regularRep.access("user", "create");
    assert.isFalse(
      regularCreateDecision.can(),
      "Regular user cannot create users"
    );

    const regularViewPostDecision = regularRep.access("post", "view");
    assert.isTrue(regularViewPostDecision.can(), "Regular user can view posts");

    const regularEditPostDecision = regularRep.access("post", "edit");
    assert.isTrue(
      regularEditPostDecision.can({ authorId: 2 }),
      "Regular user can edit their own posts"
    );
    assert.isFalse(
      regularEditPostDecision.can({ authorId: 1 }),
      "Regular user cannot edit others' posts"
    );

    // Test banned user access
    const bannedRep = await gate.buildAsync(bannedUser);
    const bannedViewPostDecision = bannedRep.access("post", "view");
    assert.isFalse(
      bannedViewPostDecision.can(),
      "Banned user cannot view posts (blocked by global guard)"
    );

    const bannedEditPostDecision = bannedRep.access("post", "edit");
    assert.isFalse(
      bannedEditPostDecision.can({ authorId: 3 }),
      "Banned user cannot edit their own posts"
    );
  });
});
