import { createSeedClient } from "@snaplet/seed";
import { copycat } from "@snaplet/copycat";
import { createClient } from "@supabase/supabase-js";

const main = async () => {
  const seed = await createSeedClient();

  await seed.$resetDatabase();
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const usersToCreate = [
    {
      email: "john.doe@example.com",
      password: "password123",
      full_name: "John Doe",
    },
    {
      email: "jane.doe@example.com",
      password: "password123",
      full_name: "Jane Doe",
    },
    {
      email: "peter.jones@example.com",
      password: "password123",
      full_name: "Peter Jones",
    },
    {
      email: "susan.smith@example.com",
      password: "password123",
      full_name: "Susan Smith",
    },
    {
      email: "mike.wilson@example.com",
      password: "password123",
      full_name: "Mike Wilson",
    },
    {
      email: "emily.brown@example.com",
      password: "password123",
      full_name: "Emily Brown",
    },
  ];
  const userIds: string[] = [];
  for (const user of usersToCreate) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        full_name: user.full_name,
      },
    });

    if (data.user?.id) {
      userIds.push(data.user.id);
    }
  }
  const mainUser = userIds[0]; // John Doe (main test user)
  const user2 = userIds[1]; // Jane Doe
  const user3 = userIds[2]; // Peter Jones
  const user4 = userIds[3]; // Susan Smith
  const user5 = userIds[4]; // Mike Wilson
  const user6 = userIds[5]; // Emily Brown

  const netOptions = ["permanent", "temporary", "none"];
  const accessOptions = ["public", "private", "members-only"];
  const environmentOptions = ["indoor", "outdoor"];

  const { parks } = await seed.parks((x) =>
    x(10, (i) => {
      const pick = <T>(arr: T[]): T => {
        return arr[copycat.int(i.index, { min: 0, max: arr.length - 1 })];
      };

      return {
        name: `${copycat.fullName(i.index)} Park`,
        location: copycat.streetAddress(i.index),
        courts: copycat.int(i.index, { min: 2, max: 4 }),
        tags: {
          net: pick(netOptions),
          access: pick(accessOptions),
          environment: pick(environmentOptions),
        },
      };
    })
  );
  const parkIds = parks.map((park) => park.id);
  const mainParkId = parkIds[0];

  // Add coordinates to the main park

  // if (coordError) {
  //   console.error('Error adding coordinates to main park:', coordError);
  // }

  await seed.park_users((x) =>
    x(6, (i) => ({
      user_id: userIds[i.index],
      park_id: mainParkId,
    }))
  );

  await seed.friendships((x) =>
    x(2, (i) => {
      const friendId = i.index === 0 ? user2 : user3;
      const [user_id_1, user_id_2] =
        mainUser < friendId ? [mainUser, friendId] : [friendId, mainUser];

      return {
        user_id_1,
        user_id_2,
      };
    })
  );

  // Create multiple friend requests - all going TO the main user
  // Note: user2 and user3 are already friends with mainUser, so only user4, user5, user6 send requests
  await seed.friend_requests((x) =>
    x(3, (i) => {
      if (i.index === 0) {
        return {
          sender_id: user4, // Susan Smith
          receiver_id: mainUser,
          status: "pending",
        };
      } else if (i.index === 1) {
        return {
          sender_id: user5, // Mike Wilson
          receiver_id: mainUser,
          status: "pending",
        };
      } else {
        return {
          sender_id: user6, // Emily Brown
          receiver_id: mainUser,
          status: "pending",
        };
      }
    })
  );

  await seed.check_ins((x) =>
    x(2, (i) => ({
      user_id: i.index === 0 ? user2 : user4,
      park_id: mainParkId,
      check_in_time: new Date(),
      check_out_time: null,
    }))
  );

  await seed.reports((x) =>
    x(1, () => ({
      park_id: mainParkId,
      user_id: mainUser,
      report_count: 8,
    }))
  );

  await seed.role_permissions((x) =>
    x(1, () => ({
      role: "moderator",
      permission: "reports.insert",
    }))
  );

  await seed.user_roles((x) =>
    x(1, () => ({
      user_id: mainUser,
      role: "moderator",
    }))
  );

  process.exit(0);
};

main();
