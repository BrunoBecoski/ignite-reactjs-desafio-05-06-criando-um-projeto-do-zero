import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../../services/prismic';

import Header from '../../components/Header';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
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
}

interface PostProps {
  post: Post;
}


export default function Post({ post }: PostProps) {
  // TODO

  // console.log(JSON.stringify(post, null, 2));

  return (
    <>
    <Header />

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
            mais que 1 min      
          </span>
        </div>

        {post.data.content.map((content) => 
          <div key={content.heading} className={styles.content}>
            <h2>{content.heading}</h2>
            <div 
              dangerouslySetInnerHTML={{ __html: content.body.text}}
            />
          </div> 
        )}
      
        </article>
      </main>
      </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  // const prismic = getPrismicClient();

  // const posts = await prismic.query([
  //   Prismic.predicates.at('document.type', 'posts')
  // ], {
  //   fetch: [],
  //   pageSize: 5,
  // });

  // TODO

  return {
    paths: [],
    fallback: 'blocking'
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const content = response.data.content.map((content) => {
      return {
        heading: content.heading,
        body: {
          text: RichText.asHtml(content.body),
        }
      }
  })

  const post = {
    first_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content,
    }
  }
  
  return {
    props: {
      post
    }
  }
};
