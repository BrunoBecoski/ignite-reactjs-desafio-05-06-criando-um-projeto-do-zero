import next, { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../../services/prismic';

import Header from '../../components/Header';
import Comments from '../../components/Comments';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';


interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
  uid: string;
}

interface PostProps {
  post: Post;
  preview: boolean;
  previousPost: null |{
    uid: string;
    title: string;
  };
  nextPost: null | {
    uid: string;
    title: string;
  };
}

export default function Post({ post, preview, previousPost, nextPost }: PostProps) {
  // TODO  
  const { isFallback } = useRouter(); 

  const reading = post.data.content.reduce((total, value) => {
    const regex = /\W+/

    const totalHeading = value.heading.split(regex).length;
    const totalContent = RichText.asText(value.body).split(regex).length;

    total = total + totalHeading;
    total = total + totalContent;

    return total;
  }, 0);

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>

      <Header />

      {isFallback ?
        <h1 className={styles.loading}>Carregando...</h1>
        :
        <>
          <img className={styles.banner} src='https://images.unsplash.com/photo-1564865878688-9a244444042a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80' alt="Eat Sleep Code Repeat" />

          <main className={commonStyles.container}>
            <article className={`${commonStyles.post} ${styles.post}`}>

              <h1>{post.data.title}</h1>
              <div className={styles.info}>
                <span>
                  <FiCalendar />
                  {format(
                    new Date(post.first_publication_date),
                    "dd MMM y",
                    {
                      locale: ptBR,
                    }
                  )}
                </span>
                <span>
                  <FiUser />
                  {post.data.author}
                </span>
                <span>
                  <FiClock />
                  {Math.ceil(reading / 200)} min      
                </span>
              </div>
              
              <time>
                {format(
                  new Date(post.last_publication_date),
                  "'* editado em' dd MMM y ', às' H':'m",
                  {
                    locale: ptBR,
                  }
                )}
               </time>

              {post.data.content.map((content) => 
                <div key={content.heading} className={styles.content}>
                  <h2>{content.heading}</h2>
                  <div 
                    dangerouslySetInnerHTML={{ __html: RichText.asHtml(content.body)}}
                  />
                </div> 
              )}
            
            </article>
            
          </main>

          <footer className={commonStyles.footer}>
            <div className={styles.footerNavLine} />
            <div className={styles.footerNav}>
              { previousPost ? 
                <span>
                  <p>{previousPost.title}</p>
                  <Link href={`/post/${previousPost.uid}`}>Post anterior</Link>
                </span>  
                :
                <span />
              }
              { nextPost ?
                <span>
                  <p>{nextPost.title}</p>
                  <Link href={`/post/${nextPost.uid}`}>Próximo post</Link>
                </span>
                :
                <span />
              }        
            </div>

            <Comments />

            {preview && (
              <a className={commonStyles.preview} href="/api/exit-preview">Sair do modo Preview</a>
            )}

          </footer>
        </>
      }
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: [],
    pageSize: 5,
  });

  // TODO

  return {
    paths: posts.results.map(result => ( { params: { slug: result.uid } })),
    fallback: true,
  }
};

export const getStaticProps: GetStaticProps<PostProps> = async ({ 
  params, 
  preview = false,
  previewData,
 }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  });

  const content = response.data.content.map((content) => {
      return {
        heading: content.heading,
        body: content.body,
      }
  })
  
  const post = {
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content,
    },
    uid: response.uid
  }
  
  const posts = await prismic.query(
    Prismic.predicates.at('document.type', 'posts'),{
      ref: previewData?.ref ?? null,
    }
  );

  const postsList = posts.results.map(result => {
    return {
      uid: result.uid,
      title: result.data.title,
    }
  });


  let index;

  for(var i = 0; i < postsList.length; i++) {
    if(postsList[i].uid === post.uid){
     index = i;
    }
  }

  let previousPost = null;
  let nextPost = null; 

  if (!(index === 0)) {
    previousPost = {
      uid: postsList[index - 1].uid,
      title: postsList[index - 1].title,
    }
  } 

  if (!(index === (postsList.length - 1))) {
    nextPost = {
      uid: postsList[index + 1].uid,
      title: postsList[index + 1].title,
    }
  } 
  
  return {
    props: {
      post,
      preview,
      previousPost,
      nextPost
    }
  }
};
