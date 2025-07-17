// src/screens/ArticleScreen.tsx

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Image,
    Dimensions,
    FlatList,
    TouchableOpacity,
    Linking,
} from 'react-native';
import Header from '../components/Header';
import FooterNav from '../components/FooterNav';
import { fetchArticleData } from '../api';
import HTMLView from 'react-native-htmlview';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PRIMARY_COLOR = '#833F6D'; // Հիմնական մանուշակագույն գույնը

// Սահմանում ենք նկարի և վերնագրի բլոկների հարաբերական չափերը
const IMAGE_CONTAINER_WIDTH_PERCENT = 0.9; // Նկարի լայնությունը էկրանի 90%-ը
const IMAGE_CONTAINER_HEIGHT_RATIO = 0.5; // Նկարի բարձրությունը իր լայնության 50%-ը

// ImageContainer-ի վերին լուսանցքը primaryBackgroundShape-ի վերևից
const IMAGE_CONTAINER_VERTICAL_OFFSET = 40; // Ֆիքսված օֆսեթ Header-ից ներքև (կարգավորել ըստ ցանկության)

const ArticleScreen = ({ route }: any) => {
    const { id } = route.params;
    const [article, setArticle] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const flatListRef = useRef<FlatList>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        fetchArticleData(id)
            .then(setArticle)
            .catch((error) => {
                console.error('Failed to fetch article:', error);
                setArticle(null);
            })
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (article?.images && article.images.length > 1) {
            const interval = setInterval(() => {
                setCurrentImageIndex((prevIndex) => {
                    const nextIndex = (prevIndex + 1) % article.images.length;
                    flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
                    return nextIndex;
                });
            }, 4000);
            return () => clearInterval(interval);
        }
    }, [article?.images]);

    const renderThumbnail = useCallback(({ item, index }: { item: string; index: number }) => (
        <TouchableOpacity
            style={[
                styles.thumbnail,
                currentImageIndex === index && styles.thumbnailSelected,
            ]}
            onPress={() => {
                setCurrentImageIndex(index);
                flatListRef.current?.scrollToIndex({ index: index, animated: true });
            }}
        >
            <Image source={{ uri: item }} style={styles.thumbnailImage} />
        </TouchableOpacity>
    ), [currentImageIndex]); // article.images-ը այստեղ կարող է ավելորդ լինել, քանի որ item-ն արդեն տրված է

    const renderNode = (node: any, index: number, siblings: any, parent: any, defaultRenderer: any) => {
        // Հղումների մշակում
        if (node.name === 'a') {
            const href = node.attribs.href;
            return (
                <Text key={index} style={htmlStyles.link} onPress={() => Linking.openURL(href)}>
                    {defaultRenderer(node.children, parent)}
                </Text>
            );
        }

        // Պատկերների մշակում՝ չափսերը կարգավորելու համար
        if (node.name === 'img') {
            const uri = node.attribs.src;
            return (
                <Image
                    key={index}
                    source={{ uri: uri }}
                    style={htmlStyles.htmlImage} // Նոր ոճ կավելացնենք ստորև
                    resizeMode="contain" // Կարգավորել ըստ անհրաժեշտության
                />
            );
        }

        // Մյուս թեգերի համար թույլ տալ defaultRenderer-ին աշխատել:
        // Հեռացնում ենք width/height ատրիբուտների մաքրումը սթայլերից,
        // քանի որ այն հաճախ խնդիրներ է առաջացնում և ավելի լավ է կառավարել HTMLView-ի մակարդակում
        // կամ CSS-ում (եթե դա webview է) կամ React Native-ի ոճերում:
        return undefined; // Այս դեպքում HTMLView-ը կօգտագործի իր default renderer-ը
    };

    if (loading) {
        return (
            <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color="#802382" />
            </View>
        );
    }

    if (!article) {
        return (
            <View style={styles.loadingBox}>
                <Text>Հոդվածը չգտնվեց կամ տվյալները սխալ են:</Text>
            </View>
        );
    }

    const mainArticleImage = article.image_url;
    const hasMultipleImages = article.images && article.images.length > 1;

    // Հաշվարկում ենք primaryBackgroundShape-ի բարձրությունը
    const primaryBackgroundHeight =
        IMAGE_CONTAINER_VERTICAL_OFFSET + // Հեռավորություն վերևից մինչև նկարի սկիզբը
        (SCREEN_WIDTH * IMAGE_CONTAINER_HEIGHT_RATIO) - // Նկարի ամբողջ բարձրությունը
        150; // Լրացուցիչ տարածք ներքևի կորության համար և նկարի տակ (կարգավորել)


    return (
        <View style={styles.container}>
            <Header />
            <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
                {/* 1. Մուգ ֆոնային բլոկը Header-ից հետո */}
                <View style={[styles.primaryBackgroundShape, { height: primaryBackgroundHeight }]}></View>

                {/* 2. Նկարի կոնտեյները (կլորացված անկյուններով) */}
                {(hasMultipleImages || mainArticleImage) && (
                    <View style={styles.imageContainer}>
                        {hasMultipleImages ? (
                            <View style={styles.imageGallery}>
                                <FlatList
                                    ref={flatListRef}
                                    data={article.images.map((img: { url: string }) => img.url)} // Ուղղում: FlatList-ին պետք է զանգված՝ url-ներով
                                    renderItem={({ item }) => (
                                        <Image source={{ uri: item }} style={styles.mainImage} resizeMode="cover" />
                                    )}
                                    keyExtractor={(item, index) => index.toString()}
                                    horizontal
                                    pagingEnabled
                                    showsHorizontalScrollIndicator={false}
                                    onMomentumScrollEnd={(event) => {
                                        const newIndex = Math.floor(
                                            event.nativeEvent.contentOffset.x / SCREEN_WIDTH
                                        );
                                        setCurrentImageIndex(newIndex);
                                    }}
                                />
                                <FlatList
                                    data={article.images.map((img: { url: string }) => img.url)} // Ուղղում: FlatList-ին պետք է զանգված՝ url-ներով
                                    renderItem={renderThumbnail}
                                    keyExtractor={(item, index) => `thumb-${index}`}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.thumbnailContainer}
                                />
                            </View>
                        ) : (
                            mainArticleImage && (
                                <Image source={{ uri: mainArticleImage }} style={styles.singleMainImage} resizeMode="cover" />
                            )
                        )}
                    </View>
                )}

                {/* 3. Վերնագրի բլոկը (նույնպես մուգ ֆոնով, ստվերներով և բարձրացված) */}
                <View style={styles.titleBlock}>
                    <Text style={styles.articleTitle}>{article.title}</Text>
                    {article.author && <Text style={styles.articleAuthor}>{article.author}</Text>}
                </View>

                {/* 4. Հոդվածի բովանդակությունը */}
                <View style={styles.contentBox}>
                    <HTMLView
                        value={article.description || article.content || ''} // Օգտագործում ենք description կամ content
                        stylesheet={htmlStyles}
                        renderNode={renderNode}
                    />
                    {article.date && (
                        <Text style={styles.articleDateFooter}>
                            {new Date(article.date).toLocaleDateString('hy-AM')}
                        </Text>
                    )}
                </View>


            </ScrollView>
            <FooterNav />
        </View>
    );
};

const htmlStyles = StyleSheet.create({
    p: { fontSize: 16, lineHeight: 24, marginBottom: 10, color: '#333' },
    b: { fontWeight: 'bold' },
    i: { fontStyle: 'italic' },
    ul: { marginBottom: 10 },
    li: { marginLeft: 20, marginBottom: 5, color: '#333' },
    strong: { fontWeight: 'bold' },
    em: { fontStyle: 'italic' },
    h1: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#333' },
    h2: { fontSize: 22, fontWeight: 'bold', marginBottom: 8, color: '#333' },
    link: { color: '#007bff', textDecorationLine: 'underline' },
    // Նոր ոճ HTML-ից եկող պատկերների համար
    htmlImage: {
        width: '100%', // Պատկերը կզբաղեցնի իր կոնտեյների ողջ լայնությունը
        height: 200, // Սահմանում ենք ֆիքսված բարձրություն կամ հաշվարկում ըստ լայնության
        resizeMode: 'contain', // Կարգավորել՝ "cover", "contain", "stretch"
        marginVertical: 10, // Լուսանցք պատկերի շուրջ
    },
});

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    body: { paddingBottom: 24 },

    // 1. Մուգ ֆոնային բլոկը
    primaryBackgroundShape: {
        width: '100%',
        backgroundColor: PRIMARY_COLOR,
        borderBottomLeftRadius: 50,
        borderBottomRightRadius: 50,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 0,
    },

    // 2. Նկարի կոնտեյները
    imageContainer: {
        width: SCREEN_WIDTH * IMAGE_CONTAINER_WIDTH_PERCENT,
        height: SCREEN_WIDTH * IMAGE_CONTAINER_HEIGHT_RATIO,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#fff',
        alignSelf: 'center',
        marginTop: IMAGE_CONTAINER_VERTICAL_OFFSET,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
        zIndex: 1,
    },
    imageGallery: {
        flex: 1,
    },
    mainImage: {
        width: '100%',
        height: '100%',
    },
    singleMainImage: {
        width: '100%',
        height: '100%',
    },
    thumbnailContainer: {
        marginTop: 10,
        paddingHorizontal: 5,
        justifyContent: 'center',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    thumbnail: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginHorizontal: 5,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    thumbnailSelected: {
        borderColor: '#802382',
    },
    thumbnailImage: {
        width: '100%',
        height: '100%',
    },

    // 3. Վերնագրի բլոկը
    titleBlock: {
        width: SCREEN_WIDTH * IMAGE_CONTAINER_WIDTH_PERCENT,
        backgroundColor: PRIMARY_COLOR,
        borderRadius: 18,
        padding: 16,
        alignSelf: 'center',
        marginTop: 12, // Փոխվել է -40-ից -12՝ նկարից 12px ներքև լինելու համար
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 5,
        zIndex: 2,
    },
    articleTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 8,
        textAlign: 'left',
    },
    articleAuthor: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.8,
        textAlign: 'center',
        marginBottom: 4,
    },
    // articleDate-ը հեռացվել է այստեղից և տեղափոխվել ներքև

    // 4. Հոդվածի բովանդակության բլոկը
    contentBox: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        marginHorizontal: 16,
        marginTop: 20,
        marginBottom: 60,
    },
    // Նոր ոճ ամսաթվի համար, որը տեղափոխվել է ներքև
    articleDateFooter: {
        fontSize: 12,
        color: '#666', // Մուգ մոխրագույն
        textAlign: 'right', // Աջ կողմ
        marginTop: 10, // Լուսանցք contentBox-ից հետո
        marginRight: 16, // Համապատասխանեցնել contentBox-ի marginHorizontal-ին
        marginBottom: 10, // Լրացուցիչ լուսանցք footer-ից առաջ
    },
});

export default ArticleScreen;