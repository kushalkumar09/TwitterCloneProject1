// Define the structure of the comment  
export type CommentType = {  
  _id: string,
  user: UserType;    // Reference to the User  
  text: string;            // Comment text  
};  

// Define the structure of the post  
export type PostType = {  
    _id: string;             
    text: string;       
    img?: string;            
    user: UserType;             
    comments: CommentType[];  
    likes: string[]; 
    following?:string[];
    createdAt:string           
};

export type UserType = {
  _id: string;
  fullName: string;
  username: string;
  email:string;
  profileImg: string;
  coverImg: string;
  bio: string;
  link: string;
  following: string[];
  followers: string[];
};