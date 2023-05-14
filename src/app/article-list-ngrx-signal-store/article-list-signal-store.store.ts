import { signalStore, withState, withComputed, withEffects, rxEffect, withUpdaters, withHooks } from '@ngrx/signal-store';
import { computed, inject } from '@angular/core';
import { pipe, switchMap, tap, lastValueFrom } from 'rxjs';
import { ArticleListState, RouteParamsPaginatonState, initialArticleListState } from '../models/article-list.state';
import { ArticlesService, ArticlesResponseType } from '../services/articles.service';
import { tapResponse } from '@ngrx/component-store';
import { HttpErrorResponse } from '@angular/common/http';

export const ArticleListSignalStore = signalStore(
  { debugId: 'ArticleListSignalStore' },
  withState<ArticleListState>(initialArticleListState),
  withComputed(({ articlesCount, pageSize }) => ({
    totalPages: computed(() => Math.ceil(articlesCount() / pageSize())),
  })),
  withComputed(({ selectedPage, totalPages }) => ({
    pagination: computed(() => ({ selectedPage, totalPages })),
  })),
  withUpdaters(({ update }) => ({
    setPaginationSettings: (s: RouteParamsPaginatonState) => update(() => ({
      selectedPage: s.selectedPage === undefined ? initialArticleListState.selectedPage : Number(s.selectedPage) - 1,
      pageSize: s.pageSize === undefined ? initialArticleListState.pageSize : Number(s.pageSize),
    })),
    setRequestStateLoading: () => update(() => ({
      httpRequestState: 'FETCHING'
    })),
    setRequestStateSuccess: (params: ArticlesResponseType) => update(() => ({
      httpRequestState: 'FETCHED',
      ...params
    })),
    setRequestStateError: (error: string) => update(() => ({
      httpRequestState: { errorMessage: error }
    })),
    setSelectedPage: (selectedPage: number) => update(() => ({
      selectedPage
    }))
  })),
  withEffects(
    ( {
      selectedPage, pageSize,
      setRequestStateLoading, setRequestStateSuccess, setRequestStateError
      },
    ) => {
      const articlesService = inject(ArticlesService)
      return {
        async loadArticles() {
          setRequestStateLoading();
          try {
            const response = await lastValueFrom(articlesService.getArticles({
              limit: pageSize(),
              offset: selectedPage() * pageSize()
            }));
            setRequestStateSuccess(response);
          }
          catch(e) {
            setRequestStateError('Request error');
          }
        },
        // loadArticles: rxEffect<void>(
        //   pipe(
        //     tap(() => setRequestStateLoading()),
        //     switchMap(() => articlesService.getArticles({
        //       limit: pageSize(),
        //       offset: selectedPage() * pageSize()
        //     })),
        //     tapResponse(
        //       (response) => {
        //         setRequestStateSuccess(response);
        //       },
        //       (errorResponse: HttpErrorResponse) => {
        //         setRequestStateError('Request error');
        //       }
        //     )
        //   )
        // )
      }
    }
  )
);
