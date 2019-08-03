export class Upload {

    $key: string;
    file: File;
    fileName: string;
    url: string;
    progress: number;
    createdAt: string;

    constructor(file: File) {
        this.file = file;
    }
}