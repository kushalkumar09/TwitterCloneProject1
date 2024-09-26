// Define the structure of the user  
export type UserType = {  
  _id: string;     // Unique identifier for the user  
  username: string;        // Username of the user  
  fullName: string;        // Full name of the user  
  profileImg?: string;     // Optional profile image URL  
};  

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
    createdAt:string           
};