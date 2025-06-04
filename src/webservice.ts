import { ScannedCode } from "./models";
import axios from 'axios';

const hostApi = 'http://localhost:3000';

export async function getAll(): Promise<ScannedCode[]> {
    try {
        const response = await axios.get(`${hostApi}/codigos`);
        return response.data as ScannedCode[];
    } catch (error) {
        console.error('Error retrieving resource', error);
        return [];
    }
}

export async function getById(id: string): Promise<ScannedCode | null> {
    try {
        const response = await axios.get(`${hostApi}/codigos/${id}`);
        return response.data as ScannedCode;
    } catch (error) {
        console.error('Error retrieving resource', error);
        return null;
    }
}

export async function create(code: ScannedCode): Promise<ScannedCode | null> {
    try {
        const response = await axios.post(`${hostApi}/codigos`, code, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data as ScannedCode;
    } catch (error) {
        console.error('Error creating resource', error);
        return null;
    }
}

export async function deleteById(id: string): Promise<boolean> {
    try {
        await axios.delete(`${hostApi}/codigos/${id}`);
        return true;
    } catch (error) {
        console.error('Error deleting resource', error);
        return false;
    }
}