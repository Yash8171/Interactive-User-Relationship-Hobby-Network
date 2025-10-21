import UserModel from "../models/User";

export async function computePopularityScore(userId: string) {
  const me = await UserModel.findById(userId);
  if (!me) throw new Error("User not found");
  const friendIds = Array.from(new Set(me.friends));
  const uniqueFriendsCount = friendIds.length;

  // fetch friends' hobbies
  const friends = await UserModel.find({ _id: { $in: friendIds } });
  let totalShared = 0;
  const myHobbies = new Set(me.hobbies || []);
  for (const f of friends) {
    for (const h of f.hobbies) {
      if (myHobbies.has(h)) totalShared++;
    }
  }
  const popularityScore = uniqueFriendsCount + totalShared * 0.5;
  return popularityScore;
}
