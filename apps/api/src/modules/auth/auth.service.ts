import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { env } from "../../config/env.js";
import { HttpError } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import type { LoginInput, RegisterInput } from "./auth.schemas.js";

const BCRYPT_COST = 12;
// Dùng khi email không tồn tại, để thời gian phản hồi không lộ email nào có trong hệ thống.
const DUMMY_HASH = bcrypt.hashSync("dummy-password", BCRYPT_COST);

type PublicUser = {
  id: string;
  email: string;
  name: string;
  slug: string;
  timezone: string;
  slotMinutes: number;
};

function toPublicUser(user: PublicUser): PublicUser {
  const { id, email, name, slug, timezone, slotMinutes } = user;
  return { id, email, name, slug, timezone, slotMinutes };
};

function slugify(name: string): string {
    const base = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
    return base || "user"
};

function isUniqueViolation(e: unknown): boolean {
    return typeof e ==="object" && e!== null && "code" in e && e.code === "P2002";
};

export function signToken(userId: string): string {
    return jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: "7d" });
};

export async function register(input: RegisterInput): Promise<PublicUser> {
    const exsisting = await prisma.user.findUnique({ where: { email: input.email }});
    if(exsisting) throw new HttpError(409, "Email already registered");

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);
    // Slug tạm: tên + 6 ký tự ngẫu nhiên. Ngày 11 sẽ cho người dùng tự đổi.
    const slug = `${slugify(input.name)}-${crypto.randomBytes(3).toString("hex")}`;

    try {
        const user = await prisma.user.create({
            data: {
                email: input.email,
                passwordHash,
                name: input.name,
                slug
            },
        });
        return toPublicUser(user);
    } catch (error) {
        if(isUniqueViolation(error)) throw new HttpError(409, "Email already registered");
        throw error;
    };
};

export async function login(input: LoginInput): Promise<PublicUser> {
 const user = await prisma.user.findUnique({ where: { email: input.email }});
 const ok = await bcrypt.compare(input.password, user?.passwordHash ?? DUMMY_HASH);
 if(!user || !ok) throw new HttpError(401, "Invalid email or password");
 return toPublicUser(user);
};

export async function getUserById(id: string): Promise<PublicUser> {
    const user = await prisma.user.findUnique({ where: { id }});
    if(!user) throw new HttpError(401, "Not authenticated!");
    return toPublicUser(user);
}