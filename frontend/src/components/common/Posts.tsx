import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { PostType } from "./types";
import { useQuery } from "@tanstack/react-query";

type PostsFeed = {
  feedType: string;
};
const Posts: React.FC<PostsFeed> = ({ feedType }) => {
  const getFeedTypeEndPoint = () => {
    switch (feedType) {
      case "forYou":
        return "/api/post/all";
      case "following":
        return "/api/post/following";
      default:
        return "/api/post/all";
    }
  };

  const feedEndPoint = getFeedTypeEndPoint();
  const {
    data: posts = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["posts", feedType],
    queryFn: async () => {
      try {
        const res = await fetch(feedEndPoint);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something Went wrong..");
        }
        return data;
      } catch (error: any) {
        throw new Error(error);
      }
    },
  });

  return (
    <>
      {isLoading && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading && error && (
        <p className="text-center my-4 text-red-500">{error.message}</p>
      )}
      {!isLoading && posts.length === 0 && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}
      {!isLoading && posts.length > 0 && (
        <div>
          {posts.map((post: PostType) => (
            <Post key={post._id.toString()} post={post} feedType={feedType}/>
          ))}
        </div>
      )}
    </>
  );
};

export default Posts;
