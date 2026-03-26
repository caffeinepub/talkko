import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Data {
    id: string;
    blob: ExternalBlob;
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createData(id: string, blob: ExternalBlob, name: string): Promise<void>;
    deleteData(id: string): Promise<void>;
    getAllData(): Promise<Array<Data>>;
    getCallerUserRole(): Promise<UserRole>;
    getData(id: string): Promise<Data | null>;
    isCallerAdmin(): Promise<boolean>;
}
