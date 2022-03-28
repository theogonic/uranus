export interface Author {
    name: string
    link?: string
}

export interface Paper {
    name: string;
    authors?: Author[];
    authorExtra?: string;
    publicAt?: string;
    abstract?: string;
    paperLink?: string;
    githubLink?: string;
    githubStarsSvgLink?: string;
    slideLink?: string;
    bibtex?: string;
    year?: string;
    month?: string;
}

export function getAuthorsInStringArr(paper: Paper): string[] | undefined {
    return paper.authors?.map(author=>{
        if(author.name.endsWith("*")){
            return author.name.replace("*","")
        }
        return author.name;
    });
}

export function authorExistInPaper(paper: Paper, authorName:string): boolean | undefined {
    return !!paper.authors?.find((author:Author)=>{

        if(!author){
            return false;
        }

        let name:string;
        if(author.name.endsWith("*")){
            name = author.name.replace("*","")
        } else {
            name = author.name
        }
        return name == authorName;
    }) ;
}