import { PolicyActionMapTuple } from "src/types/action";
import { createPolicy, Gate } from "../src/index";
import { it, describe, assert } from "vitest";

interface User {
  id: number;
  role: ("admin" | "user")[];
}

interface Plan {
  id: number;
  features: Record<string, boolean>;
}

interface Post {
  id?: number;
  authorId: number;
}

interface Video {
  id: number;
  views: number;
  isPaid: boolean;
  authorId: number;
}

type PostPolicy = {
  update: PolicyActionMapTuple<User, Post>;
  delete: PolicyActionMapTuple<User>;
};

describe("RBAC", () => {
  const gate = new Gate<{ post: PostPolicy }>();

  // polices
  const postPolicy = createPolicy<PostPolicy, "post">("post", {
    update: (user: User, post: Post) => {
      return user.role.includes("admin") || user.id === post?.authorId;
    },
    delete: (user: User) => {
      return user.role.includes("admin");
    }
  });

  gate.addPolicy(postPolicy);

  // different representatives
  const representative = gate.build({ id: 1, role: ["user"] });
  const adminRepresentative = gate.build({ id: 2, role: ["admin"] });

  it("Delete post access", () => {
    assert.isFalse(
      representative.access("post", "delete").can(),
      "User can't delete post"
    );
    assert.isTrue(
      adminRepresentative.access("post", "delete").can(),
      "Admin should be able to delete any post"
    );
  });

  it("Update post access", () => {
    assert.isFalse(
      representative.access("post", "update").can(),
      "User can't update post"
    );
    assert.isTrue(
      representative.access("post", "update").can({ authorId: 1 }),
      "User should be able to update own post"
    );
    assert.isFalse(
      representative.access("post", "update").can({ authorId: 2 }),
      "User can't update other's post"
    );
    assert.isTrue(
      adminRepresentative.access("post", "update").can({ authorId: 5 }),
      "Admin should be able to update any post"
    );
  });
});

describe("RBAC with global guard", () => {
  const gate = new Gate();

  // global guard
  gate.guard((user: User & { plan?: Plan }) => {
    if (user.role.includes("admin")) {
      return true;
    }

    if (!user.plan) {
      return false;
    }
  });

  // policies
  const videoPolicy = createPolicy("video", {
    view: (user: User & { plan: Plan }, video?: Video) => {
      if (video?.isPaid && !user.plan.features.paidVideos) {
        return false;
      }

      return true;
    },
    upload: (user: User & { plan: Plan }) => {
      return !!user.plan.features.uploadVideo;
    },
    edit: (user: User & { plan: Plan }, video?: Video) => {
      if (!video) {
        return false;
      }

      return video.views < 10 && user.id === video.authorId;
    }
  });
  gate.addPolicy(videoPolicy);

  const userWithPlan = gate.build({
    id: 1,
    role: ["user"],
    plan: { id: 1, features: { paidVideos: false } }
  });

  const userWithoutPlan = gate.build({
    id: 2,
    role: ["user"]
  });

  const admin = gate.build({ id: 3, role: ["admin"] });

  it("User without plan", () => {
    assert.isFalse(
      userWithoutPlan.access("video", "view").can({ isPaid: true }),
      "Without plan should'n get access to the paid video"
    );

    assert.isFalse(
      userWithoutPlan.access("video", "upload").can(),
      "Without plan user can't upload a video"
    );

    assert.isTrue(
      userWithoutPlan.access("video", "view").isGuardDecision,
      "Without plan the guard should have taken the decision."
    );
  });

  it("User with plan", () => {
    assert.isTrue(
      userWithPlan.access("video", "view").can(),
      "It should pass the view access with plan property"
    );

    assert.isFalse(
      userWithPlan.access("video", "view").can({ id: 555, isPaid: true }),
      "It should deny access by the property check"
    );

    assert.isFalse(
      userWithPlan.access("video", "edit").can({ authorId: 2 }),
      "It should deny edit access by the property check"
    );

    assert.isTrue(
      userWithPlan.access("video", "edit").can({ authorId: 1, views: 1 }),
      "It should pass edit access by the property check"
    );

    assert.isFalse(
      userWithPlan.access("video", "edit").can({ authorId: 1, views: 10 }),
      "It should deny edit access due to the views property"
    );
  });
});
