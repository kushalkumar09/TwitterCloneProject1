import { Link } from "react-router-dom";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton.tsx";
// import { USERS_FOR_RIGHT_PANEL } from "../../utils/db/dummy";
import { useQuery } from "@tanstack/react-query";
import useFollowUnfollow from "../../hooks/useFollow.tsx";
import LoadingSpinner from "./LoadingSpinner.tsx";

interface SuggestedUserType {
    _id: string;
    fullName: string;
    username: string;
    profileImg: string;
}
const RightPanel = () => {
	const {data:suggestedUsers,isLoading} = useQuery<SuggestedUserType[]>({queryKey:["suggestedUser"],
		queryFn:async()=>{
			try {
				const res = await fetch("/api/user/suggested");
				if(!res.ok){
					const data = await res.json();
					throw new Error(data.error||"Something Went Wrong");
				}
				const data = await res.json();
				return data;
			} catch (error:any) {
				throw new Error(error.message)
			}
		}
	})

	const {followUnfollow,isPending}= useFollowUnfollow();

	return (
		<div className='hidden lg:block my-4 mx-2'>
			<div className='bg-[#16181C] p-4 rounded-md sticky top-2'>
				<p className='font-bold'>Who to follow</p>
				<div className='flex flex-col gap-4'>
					{/* item */}
					{isLoading && (
						<>
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
						</>
					)}
					{!isLoading &&
						suggestedUsers?.map((user) => (
							<Link
								to={`/profile/${user.username}`}
								className='flex items-center justify-between gap-4'
								key={user._id}
							>
								<div className='flex gap-2 items-center'>
									<div className='avatar'>
										<div className='w-8 rounded-full'>
											<img src={user.profileImg || "/avatar-placeholder.png"} />
										</div>
									</div>
									<div className='flex flex-col'>
										<span className='font-semibold tracking-tight truncate w-28'>
											{user.fullName}
										</span>
										<span className='text-sm text-slate-500'>@{user.username}</span>
									</div>
								</div>
								<div>
									<button
										className='btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm'
										onClick={(e)=>{
											e.preventDefault();
											followUnfollow(user._id)
										}}
									>
										{isPending?<LoadingSpinner/>:"Follow"}
									</button>
								</div>
							</Link>
						))}
				</div>
			</div>
		</div>
	);
};
export default RightPanel;