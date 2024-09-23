import React, { useEffect, useState } from 'react';  
import Post from "./Post";  
import PostSkeleton from "../skeletons/PostSkeleton";  
import { POSTS } from "../../utils/db/dummy"; // Assuming POSTS is an array of PostType  
import { PostType } from './types'; // Adjust the path as necessary  

const Posts: React.FC = () => {  
  const [posts, setPosts] = useState<PostType []>([]);  
  const [isLoading, setIsLoading] = useState<boolean>(true);  
  const [error, setError] = useState<string | null>(null);  

  useEffect(() => {  
    const fetchPosts = async () => {  
      try {  
        // Simulate a fetch operation  
        setIsLoading(true);  
        // You can replace this with an actual API call  
        const fetchedPosts: PostType[] = await new Promise((resolve) => {  
          setTimeout(() => resolve(POSTS as PostType []), 1000); // Simulating a delay  
        });  
        setPosts(fetchedPosts);  
      } catch (err) {  
        setError('Failed to load posts. Please try again later.');  
      } finally {  
        setIsLoading(false);  
      }  
    };  

    fetchPosts();  
  }, []);  

  return (  
    <>  
      {isLoading && (  
        <div className='flex flex-col justify-center'>  
          <PostSkeleton />  
          <PostSkeleton />  
          <PostSkeleton />  
        </div>  
      )}  
      {!isLoading && error && (  
        <p className='text-center my-4 text-red-500'>{error}</p>  
      )}  
      {!isLoading && posts.length === 0 && (  
        <p className='text-center my-4'>No posts in this tab. Switch 👻</p>  
      )}  
      {!isLoading && posts.length > 0 && (  
        <div>  
          {posts.map((post: PostType) => (  
            <Post key={post._id.toString()} post={post} />  
          ))}  
        </div>  
      )}  
    </>  
  );  
};  

export default Posts;