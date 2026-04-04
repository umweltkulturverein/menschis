import { ColumnType, Generated } from "kysely";

export interface PersonTable {
    id: Generated<number>;
    sub: string;
    name: string;
    email: string | null;
    phone: string | null;
    loginToken: string | null;
    roles: ColumnType<string[] | null, string[] | null, string[] | null>;
}
