
class GroupRequestEntity {

    id: string;
    name: string | undefined;
    description: string | undefined;
    address: string | undefined;
    picture: string | undefined;
    parentId: string | undefined;

    constructor(id: string,
                name: string | undefined,
                description: string | undefined,
                address: string | undefined,
                picture: string | undefined,
                parentId: string | undefined) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.address = address;
        this.picture = picture;
        this.parentId = parentId;
    }
}

export { GroupRequestEntity };