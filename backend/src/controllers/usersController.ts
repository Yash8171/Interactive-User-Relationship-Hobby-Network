import { Request, Response, NextFunction } from "express";
import UserModel from "../models/User";
import { computePopularityScore } from "../utils/popularity";
import { BadRequest, NotFound, ConflictError } from "../utils/errors";

function normalizeFriendPair(a:string, b:string) {
  return a < b ? [a,b] : [b,a];
}

export async function getUsers(req:Request,res:Response,next:NextFunction){
  try{
    const users = await UserModel.find();
    const usersWithScore = await Promise.all(users.map(async (u:any) => {
      const score = await computePopularityScore(u._id);
      return { id: u._id, username: u.username, age: u.age, hobbies: u.hobbies, friends: u.friends, createdAt: u.createdAt, popularityScore: score };
    }));
    res.json(usersWithScore);
  }catch(e){ next(e); }
}

export async function createUser(req:Request,res:Response,next:NextFunction){
  try{
    const { username, age, hobbies } = req.body;
    if (!username || typeof age !== 'number' || !Array.isArray(hobbies)) throw new BadRequest("Validation failed");
    const u = new UserModel({ username, age, hobbies, friends: [] });
    const saved = await u.save();
    res.status(201).json({ id: saved._id, username: saved.username, age: saved.age, hobbies: saved.hobbies, friends: saved.friends, createdAt: saved.createdAt, popularityScore: 0 });
  }catch(e){ next(e); }
}

export async function updateUser(req:Request,res:Response,next:NextFunction){
  try{
    const id = req.params.id;
    const { username, age, hobbies } = req.body;
    const existing = await UserModel.findById(id);
    if(!existing) throw new NotFound("User not found");
    existing.username = username ?? existing.username;
    existing.age = typeof age === 'number' ? age : existing.age;
    existing.hobbies = Array.isArray(hobbies) ? hobbies : existing.hobbies;
    await existing.save();
    const score = await computePopularityScore(id);
    res.json({ id: existing._id, username: existing.username, age: existing.age, hobbies: existing.hobbies, friends: existing.friends, createdAt: existing.createdAt, popularityScore: score });
  }catch(e){ next(e); }
}

export async function deleteUser(req:Request,res:Response,next:NextFunction){
  try{
    const id = req.params.id;
    const existing = await UserModel.findById(id);
    if(!existing) throw new NotFound("User not found");
    if((existing.friends || []).length > 0) throw new ConflictError("User still linked to friends; unlink first");
    await existing.remove();
    res.status(204).send();
  }catch(e){ next(e); }
}

export async function linkUser(req:Request,res:Response,next:NextFunction){
  try{
    const id = req.params.id;
    const { targetId } = req.body;
    if(!targetId) throw new BadRequest("targetId required");
    if(id === targetId) throw new BadRequest("Cannot friend yourself");

    const [a,b] = normalizeFriendPair(id, targetId);
    const userA = await UserModel.findById(a);
    const userB = await UserModel.findById(b);
    if(!userA || !userB) throw new NotFound("One or both users not found");

    // prevent duplicate: since we maintain mutual lists, check both
    if(userA.friends.includes(b) || userB.friends.includes(a)) throw new ConflictError("Friendship already exists");

    // add each other
    userA.friends = Array.from(new Set([...userA.friends, b]));
    userB.friends = Array.from(new Set([...userB.friends, a]));
    await userA.save();
    await userB.save();
    res.status(201).json({ message: "linked" });
  }catch(e){ next(e); }
}

export async function unlinkUser(req:Request,res:Response,next:NextFunction){
  try{
    const id = req.params.id;
    const { targetId } = req.body;
    if(!targetId) throw new BadRequest("targetId required");
    const [a,b] = normalizeFriendPair(id, targetId);
    const userA = await UserModel.findById(a);
    const userB = await UserModel.findById(b);
    if(!userA || !userB) throw new NotFound("One or both users not found");
    // check exists
    if(!userA.friends.includes(b) && !userB.friends.includes(a)) throw new NotFound("Friendship not found");
    userA.friends = userA.friends.filter(x=>x!==b);
    userB.friends = userB.friends.filter(x=>x!==a);
    await userA.save();
    await userB.save();
    res.status(204).send();
  }catch(e){ next(e); }
}

export async function getGraph(req:Request,res:Response,next:NextFunction){
  try{
    const users = await UserModel.find();
    const nodes = await Promise.all(users.map(async (u:any) => ({
      id: u._id,
      username: u.username,
      age: u.age,
      hobbies: u.hobbies,
      createdAt: u.createdAt,
      popularityScore: await computePopularityScore(u._id)
    })));
    // build unique undirected edge list
    const edgesMap = new Map<string, any>();
    for(const u of users){
      for(const f of u.friends || []){
        const key = u._id < f ? `${u._id}|${f}` : `${f}|${u._id}`;
        edgesMap.set(key, { source: key.split('|')[0], target: key.split('|')[1] });
      }
    }
    const edges = Array.from(edgesMap.values());
    res.json({ nodes, edges });
  }catch(e){ next(e); }
}
