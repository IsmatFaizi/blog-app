import { withAuthenticator } from "@aws-amplify/ui-react";
import { useState, useRef, React } from "react";
import { API, Storage } from "aws-amplify";
import { useRouter } from "next/router";
import { v4 as uuid } from "uuid";
import { createPost } from "../src/graphql/mutations";
import dynamic from "next/dynamic";
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});
import "easymde/dist/easymde.min.css";

const initailState = { title: "", content: "" };
const CreatPost = () => {
  const [post, setPost] = useState(initailState);
  const [image, setIamge] = useState(null);
  const imageFileInput = useRef(null);
  const { title, content } = post;
  const router = useRouter();

  let onChange = (e) => {
    setPost(() => ({ ...post, [e.target.name]: e.target.value }));
  };

  let uploadImage = async () => {
    imageFileInput.current.click();
  };

  let handelChange = (e) => {
    const fileUploaded = e.target.files[0];
    if (!fileUploaded) {
      return;
    }
    setIamge(fileUploaded);
  };
  const createNewPost = async () => {
    if (!title || !content) {
      return;
    }
    const id = uuid();
    if (image) {
      const filename = `${image.name}_${uuid()}`;
      post.coverImage = filename;
      await Storage.put(filename, image);
    }
    post.id = id;
    await API.graphql({
      query: createPost,
      variables: { input: post },
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });
    router.push(`/posts/${id}`);
  };

  return (
    <div>
      <h1 className="text-3xl front-semibold tracking-wide mt-6">
        Create new post
      </h1>
      <input
        onChange={onChange}
        name="title"
        placeholder="Title"
        value={post.title}
        className="border-b pb-2 text-lg my-4
      focus:outline-none w-full font-light text-gray-500 
      placeholder-gray-500 y-2"
      />
      {image && (
        <img src={URL.createObjectURL(image)}
        className="my-4" />
      )}
      <SimpleMDE
        value={post.content}
        onChange={(value) => setPost({ ...post, content: value })}
      />
      <input
        type="file"
        ref={imageFileInput}
        className="absolute w-0 h-0"
        onChange={handelChange}
      />
      <button
        type="button"
        className="bg-green-600 text-white font-semibold
      px-8 py-2 rounded-lg mr-2"
        onClick={uploadImage}
      >Upload Cover Image</button>
      {" "}
      <button
        type="button"
        className="mb-4 bg-blue-600 text-white 
      font-semibold px-8 py-2 rounded-lg"
        onClick={createNewPost}
      >Create Post</button>
    </div>
  );
};

export default withAuthenticator(CreatPost);
