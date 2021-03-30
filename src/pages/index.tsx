import { GetStaticProps } from 'next';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Link from 'next/link';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}


export default function Home({ postsPagination }: HomeProps) {
  // TODO

  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [availableButton, setAvailableButton] = useState(postsPagination.next_page);

  async function handleLoadMore() {  
    let dataResponse;

    await fetch(`${postsPagination.next_page}`)
        .then(response => response.json())
          .then(data => dataResponse = data);        
          
    const formatMorePost: Post[] = dataResponse.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        }
      }
    });
    
    setAvailableButton(dataResponse.next_page);
    setPosts([...posts, ...formatMorePost]);
  }

  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>
      <main className={commonStyles.container}>
        <div className={styles.logo}>
          <img src="/images/logo.svg" alt="logo"/>
        </div> 

        <div className={`${commonStyles.post} ${styles.post}`}>
          {posts.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <h1>{post.data.title}</h1>
                <p>{post.data.subtitle}</p>
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
                </div>
              </a>
            </Link>
          ))}
         
          { availableButton ? 
            <button className={styles.button} type="button" onClick={handleLoadMore}>Carregar mais posts</button>
            :
            ''
          }
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: ['publication.title', 'publication.content'],
    pageSize: 5,
  });
  
  // TODO

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    };
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      }
    }
  }
};
