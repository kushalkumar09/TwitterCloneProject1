import XSvg from "../svgs/X.tsx"

import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

type UserData = {
	fullName:string,
	username:string,
	profileImg:string,
}
const Sidebar = () => {
	
	const queryClient = useQueryClient();
	const {data: userData} = useQuery<UserData>({queryKey:["authenticatedUser"]})
	const {mutate:logOut} = useMutation({mutationFn:async()=>{
		try {
			const response = await fetch("/api/auth/logout",{
				method:"Post",
			})

			if (!response.ok) {
				const errorResponse = await response.json();
				throw new Error(errorResponse.error || "LogOut failed");
			}
		
			return await response.json();
		} catch (error:any) {
			console.log("Error during LogOut:", error);
			toast.error(error.message || "An error occurred during LogOut");
			throw error;
		}
	},
	onSuccess:()=>{
		queryClient.invalidateQueries({queryKey:["authenticatedUser"]})
		toast.success("LogOut Successfull....")

	}
});

	const handleLogOut = (e:any) => {  
        e.preventDefault(); 
        logOut();  
    }; 

	return (
		<div className='md:flex-[2_2_0] w-18 max-w-52'>
			<div className='sticky top-0 left-0 h-screen flex flex-col border-r border-gray-700 w-20 md:w-full'>
				<Link to='/' className='flex justify-center md:justify-start'>
					<XSvg className='px-2 w-12 h-12 rounded-full fill-white hover:bg-stone-900' />
				</Link>
				<ul className='flex flex-col gap-3 mt-4'>
					<li className='flex justify-center md:justify-start'>
						<Link
							to='/'
							className='flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
						>
							<MdHomeFilled className='w-8 h-8' />
							<span className='text-lg hidden md:block'>Home</span>
						</Link>
					</li>
					<li className='flex justify-center md:justify-start'>
						<Link
							to='/notifications'
							className='flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
						>
							<IoNotifications className='w-6 h-6' />
							<span className='text-lg hidden md:block'>Notifications</span>
						</Link>
					</li>

					<li className='flex justify-center md:justify-start'>
						<Link
							to={`/profile/${userData?.username}`}
							className='flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
						>
							<FaUser className='w-6 h-6' />
							<span className='text-lg hidden md:block'>Profile</span>
						</Link>
					</li>
				</ul>
				{userData && (
					<Link
						to={`/profile/${userData.username}`}
						className='mt-auto mb-10 flex gap-2 items-start transition-all duration-300 hover:bg-[#181818] py-2 px-4 rounded-full'
					>
						<div className='avatar hidden md:inline-flex'>
							<div className='w-8 rounded-full'>
								<img src={userData?.profileImg || "/avatar-placeholder.png"} />
							</div>
						</div>
						<div className='flex justify-between flex-1'>
							<div className='hidden md:block'>
								<p className='text-white font-bold text-sm w-20 truncate'>{userData?.fullName}</p>
								<p className='text-slate-500 text-sm'>@{userData?.username}</p>
							</div>
							<BiLogOut className='w-5 h-5 cursor-pointer' 
							onClick={handleLogOut}/>
						</div>
					</Link>
				)}
			</div>
		</div>
	);
};
export default Sidebar;