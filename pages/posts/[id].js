import { useState, React, useEffect } from "react";
import { API, Storage,Auth, Hub } from "aws-amplify";
import { useRouter } from "next/router";
import ReactMarkdown from "react-markdown";
import { listPosts, getPost } from "../../src/graphql/queries";
import { createComment } from "../../src/graphql/mutations";
import '../../configureAmplify';
import dynamic from "next/dynamic";
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});
import "easymde/dist/easymde.min.css";
import { v4 as uuid } from "uuid";

const intialState = { message: "" };

const Post = ({ post }) => {
  const [signedUser, setSignedUser]= useState(false);
  const [coverImage, setCoverImage] = useState(null);
  const [comment, setComment] = useState(intialState);
  const [showMe, setShowMe] = useState(false);
  const router = useRouter();
  const { message } = comment;

  const toggle = () => {
    setShowMe(!showMe);
  };
  const authListener = async () =>{
    Hub.listen("auth", (data)=>{
        switch (data.payload.event){
             case 'signIn':
                return setSignedUser(true)
             case 'signOut':
                return setSignedUser(false)
        }
    }) 
     try {
        await Auth.currentAuthenticatedUser();
        setSignedUser(true);
    }
     catch (err){
         console.log(err);
    }
 }
  useEffect(() => {
    updateCoverImage();
    authListener();
  }, []);

  const updateCoverImage = async () => {
    if (post.coverImage) {
      const imageKey = await Storage.get(post.coverImage);
      setCoverImage(imageKey);
    }
  };

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  const createTheComment = async () => {
    if (!message) {
      return;
    }
    const id = uuid();
    comment.id = id;

    try {
      await API.graphql({
        query: createComment,
        variables: { input: comment },
        authMode: "AMAZON_COGNITO_USER_POOLS",
      });
    } catch (err) {
      console.log(err);
    }
    router.push("/");
  };

  return (
    <div>
      <h1 className="text-5xl mt-4 font-semibold tracing-wide">{post.title}</h1>
      <p className="text-sm font-light my-4">By {post.username}</p>
      {coverImage && <img src={coverImage} className="mt4" />}
      <div className="mt-8">
        <ReactMarkdown className="prose" children={post.content} />
      </div>
      <div>
        {signedUser && (<button
          type="button"
          className="mb-4 bg-green-600
                text-white font-semibold px-8 py-2 rounded-lg"
          onClick={toggle}
        >
          Write a Comment
        </button>
        )}

        {
          <div style={{ display: showMe ? "block" : "none" }}>
            <SimpleMDE
              value={comment.message}
              onChange={(value) =>
                setComment({ ...comment, message: value, postID: post.id })
              }
            />
            <button
              type="button"
              className="mb-4 bg-green-600
                        text-white font-semibold px-8 py-2 rounded-lg"
              onClick={createTheComment}
            >
              Save
            </button>
          </div>
        }
      </div>
    </div>
  );
};

export const getStaticPaths = async () => {
  const postData = await API.graphql({
    query: listPosts,
  });
  const paths = postData.data.listPosts.items.map((post) => ({
    params: { id: post.id },
  }));
  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps = async ({ params }) => {
  const { id } = params;
  const postData = await API.graphql({
    query: getPost,
    variables: { id },
  });
  return {
    props: {
      post: postData.data.getPost,
    },
    revalidate: 60,
  };
};

export default Post;
