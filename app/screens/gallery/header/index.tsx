// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable react/prop-types */
// React prop validations are not recognized with forwardRef

import Clipboard from '@react-native-community/clipboard';

import React, {forwardRef, useEffect, useRef, useState, useImperativeHandle} from 'react';
import {injectIntl} from 'react-intl';
import {Animated, Easing, StyleSheet} from 'react-native';

import {Client4} from '@client/rest';
import {ATTACHMENT_DOWNLOAD} from '@constants/attachment';
import EventEmitter from '@mm-redux/utils/event_emitter';

import PrepareFile from './prepare_file';
import Summary from './summary';
import Toast from './toast';

import type {CallbackFunctionWithoutArguments, PrepareFileRef, HeaderProps, HeaderRef, ShowToast, ToastRef} from '@mm-types/screens/gallery';

const styles = StyleSheet.create({
    header: {
        position: 'absolute',
        bottom: 0,
        height: 70,
        width: '100%',
        elevation: 10,
    },
});

const Header = forwardRef<HeaderRef, HeaderProps>((props: HeaderProps, ref) => {
    const [visible, setVisible] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const opacity = useRef(new Animated.Value(1)).current;
    const downloadingOpacitity = useRef(new Animated.Value(0)).current;
    const prepareRef = useRef<PrepareFileRef>(null);
    const toastRef = useRef<ToastRef>(null);

    const animate = (value: Animated.Value, show: boolean, callback?: () => void): Animated.CompositeAnimation => {
        const animation = Animated.timing(value, {
            toValue: show ? 1 : 0,
            duration: 200,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
        });

        animation.start(callback);

        return animation;
    };

    const copyPublicLink = async (callback: CallbackFunctionWithoutArguments) => {
        try {
            const {formatMessage} = props.intl;
            const message = formatMessage({id: 'mobile.public_link.copied', defaultMessage: 'Public link copied'});
            const res = await Client4.getFilePublicLink(props.file.id);
            Clipboard.setString(res.link);
            showToast(message, 100, callback);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.log('An error occurred, we should show a different toast', e);
            callback();
        }
    };

    const dowloadFile = (callback: CallbackFunctionWithoutArguments) => {
        setDownloading(true);
        callback();
    };

    const isVisible = () => visible;

    const showToast: ShowToast = (text, duration, callback) => {
        toastRef.current?.show(text, duration, callback);
    };

    const openOrShare = (share: boolean, callback: (path?: string) => void) => {
        animate(opacity, false, () => {
            animate(downloadingOpacitity, true, async () => {
                const path = await prepareRef.current?.start(props.file, share);
                animate(opacity, true);
                callback(path);
            });
        });
    };

    const startDownload = async (): Promise<string | undefined> => {
        let path;
        if (prepareRef.current) {
            path = await prepareRef.current.start(props.file);
        }
        setDownloading(false);

        return path;
    };

    const toggle = () => {
        if (!downloading) {
            setVisible(!visible);
            return !visible;
        }

        return false;
    };

    useEffect(() => {
        const animation = animate(opacity, visible);

        return animation.stop;
    }, [visible]);

    useEffect(() => {
        let animation: Animated.CompositeAnimation;
        if (downloading) {
            animate(opacity, false, () => {
                animation = animate(downloadingOpacitity, true, startDownload);
            });
        } else {
            animate(downloadingOpacitity, false, () => {
                animation = animate(opacity, true);
            });
        }

        return () => animation?.stop();
    }, [downloading]);

    useEffect(() => {
        EventEmitter.on(ATTACHMENT_DOWNLOAD, openOrShare);

        return () => {
            EventEmitter.off(ATTACHMENT_DOWNLOAD, openOrShare);
        };
    });

    useImperativeHandle(ref, () => ({
        isVisible,
        setVisible,
        toggle,
    }), [visible]);

    return (
        <>

            <Animated.View style={[{opacity}, styles.header]}>
                <Summary
                    copyPublicLink={copyPublicLink}
                    dowloadFile={dowloadFile}
                    file={props.file}
                />
                <Toast ref={toastRef}/>
            </Animated.View>
            <Animated.View style={[{opacity: downloadingOpacitity}, styles.header]}>
                <PrepareFile
                    ref={prepareRef}
                    intl={props.intl}
                />
            </Animated.View>
        </>
    );
});

Header.displayName = 'Header';

export default injectIntl(Header, {withRef: true});
