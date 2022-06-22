import { Application } from '@logto/schemas';
import { MDXProvider } from '@mdx-js/react';
import i18next from 'i18next';
import { MDXProps } from 'mdx/types';
import React, { cloneElement, lazy, LazyExoticComponent, Suspense, useState } from 'react';

import CodeEditor from '@/components/CodeEditor';
import { applicationTypeAndSdkTypeMappings, SupportedSdk } from '@/types/applications';

import GuideHeader from '../GuideHeader';
import SdkSelector from '../SdkSelector';
import StepsSkeleton from '../StepsSkeleton';
import * as styles from './index.module.scss';

type Props = {
  app: Application;
  isCompact?: boolean;
  onClose: () => void;
};

const Guides: Record<string, LazyExoticComponent<(props: MDXProps) => JSX.Element>> = {
  ios: lazy(async () => import('@/assets/docs/tutorial/integrate-sdk/ios.mdx')),
  android: lazy(async () => import('@/assets/docs/tutorial/integrate-sdk/android.mdx')),
  react: lazy(async () => import('@/assets/docs/tutorial/integrate-sdk/react.mdx')),
  vue: lazy(async () => import('@/assets/docs/tutorial/integrate-sdk/vue.mdx')),
  'android_zh-cn': lazy(
    async () => import('@/assets/docs/tutorial/integrate-sdk/android_zh-cn.mdx')
  ),
  'react_zh-cn': lazy(async () => import('@/assets/docs/tutorial/integrate-sdk/react_zh-cn.mdx')),
  'vue_zh-cn': lazy(async () => import('@/assets/docs/tutorial/integrate-sdk/vue_zh-cn.mdx')),
};

const Guide = ({ app, isCompact, onClose }: Props) => {
  const { id: appId, name: appName, type: appType } = app;
  const sdks = applicationTypeAndSdkTypeMappings[appType];
  const [selectedSdk, setSelectedSdk] = useState<SupportedSdk>(sdks[0]);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);

  const locale = i18next.language;
  const guideI18nKey = `${selectedSdk}_${locale}`.toLowerCase();
  const GuideComponent = Guides[guideI18nKey] ?? Guides[selectedSdk.toLowerCase()];

  return (
    <div className={styles.container}>
      <GuideHeader
        appName={appName}
        selectedSdk={selectedSdk}
        isCompact={isCompact}
        onClose={onClose}
      />
      <div className={styles.content}>
        {cloneElement(<SdkSelector sdks={sdks} selectedSdk={selectedSdk} />, {
          className: styles.banner,
          isCompact,
          onChange: setSelectedSdk,
          onToggle: () => {
            setActiveStepIndex(0);
          },
        })}
        <MDXProvider
          components={{
            code: ({ className, children }) => {
              const [, language] = /language-(\w+)/.exec(className ?? '') ?? [];

              return <CodeEditor isReadonly language={language} value={String(children)} />;
            },
          }}
        >
          <Suspense fallback={<StepsSkeleton />}>
            {GuideComponent && (
              <GuideComponent
                appId={appId}
                activeStepIndex={activeStepIndex}
                onNext={(nextIndex: number) => {
                  setActiveStepIndex(nextIndex);
                }}
                onComplete={onClose}
              />
            )}
          </Suspense>
        </MDXProvider>
      </div>
    </div>
  );
};

export default Guide;