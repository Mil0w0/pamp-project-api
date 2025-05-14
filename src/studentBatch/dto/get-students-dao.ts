export class GetStudent {
    user_id: string
    email: string
    first_name: string
    last_name: string
    is_active: boolean
    role: string
}

export class CreateStudent {
    id?: string
    email: string
    first_name: string
    last_name: string
}

export class CreateStudentsResponse {
    created_count : number
    students: GetStudent[]
}