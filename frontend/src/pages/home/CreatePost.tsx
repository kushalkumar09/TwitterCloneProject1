import React, { useRef, useState, ChangeEvent, FormEvent } from "react";
import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { IoCloseSharp } from "react-icons/io5";
import {  useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { UserType } from "../../components/common/types";

interface CreatePostProps {
  // Add any props here if needed
}

const CreatePost: React.FC<CreatePostProps> = () => {
  const {data} = useQuery<UserType>({queryKey:["authenticatedUser"]})
  const queryClient = useQueryClient();

  const [text, setText] = useState<string>("");
  const [img, setImg] = useState<string | null>(null);

  const imgRef = useRef<HTMLInputElement>(null);

 

  const {mutate:createNewPost, isError,isPending,error} = useMutation({mutationFn:async () => {
    try {
      const res = await fetch("/api/post/create",{
        method:"Post",
        headers:{
          "Content-Type":"application/json"
        },
        body: JSON.stringify({text,img})

      })
      if(!res.ok){
        const data = await res.json();
        throw new Error(data.error)
      }
      const data = await res.json();
      return data
    } catch (error:any) {
      throw new Error(error.message)
    }
  },
  onSuccess:()=>{
    setText("");
    setImg(null)
    queryClient.invalidateQueries({queryKey:["posts"]})
    toast.success("Post Created successfully")
  }
})
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createNewPost();
  };

  const handleImgChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        setImg(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex p-4 items-start gap-4 border-b border-gray-700">
      <div className="avatar">
        <div className="w-8 rounded-full">
          <img src={data?.profileImg || "/avatar-placeholder.png"} alt="Profile" />
        </div>
      </div>
      <form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
        <textarea
          className="textarea w-full p-0 text-lg resize-none border-none focus:outline-none border-gray-800"
          placeholder="What is happening?!"
          value={text}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
        />
        {img && (
          <div className="relative w-72 mx-auto">
            <IoCloseSharp
              className="absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer"
              onClick={() => {
                setImg(null);
                if (imgRef.current) imgRef.current.value = "";
              }}
            />
            <img src={img} className="w-full mx-auto h-72 object-contain rounded" alt="Selected" />
          </div>
        )}

        <div className="flex justify-between border-t py-2 border-t-gray-700">
          <div className="flex gap-1 items-center">
            <CiImageOn
              className="fill-primary w-6 h-6 cursor-pointer"
              onClick={() => imgRef.current?.click()}
            />
            <BsEmojiSmileFill className="fill-primary w-5 h-5 cursor-pointer" />
          </div>
          <input type="file" hidden ref={imgRef} onChange={handleImgChange} accept="image/*" />
          <button className="btn btn-primary rounded-full btn-sm text-white px-4" type="submit">
            {isPending ? "Posting..." : "Post"}
          </button>
        </div>
        {isError && <div className="text-red-500">{error.message}</div>}
      </form>
    </div>
  );
};

export default CreatePost;