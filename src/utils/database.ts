import fs from 'fs';
import path from 'path';
import { User } from '../types';

let users: User[] = [];

export const loadUsers = (): void => {
  try {
    const usersPath = path.join(__dirname, '../../database/users.json');
    const usersData = fs.readFileSync(usersPath, 'utf-8');
    users = JSON.parse(usersData);
    console.log(`Loaded ${users.length} users from database`);
  } catch (error) {
    console.error('Error loading users:', error);
    users = [];
  }
};

export const findUserByUsername = (username: string): User | undefined => {
  return users.find(user => user.username === username);
};

export const findUserById = (id: number): User | undefined => {
  return users.find(user => user.id === id);
};

// Initialize users on module load
loadUsers();
