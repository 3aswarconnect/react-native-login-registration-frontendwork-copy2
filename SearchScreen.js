import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    FlatList, 
    Image,
    Alert
} from 'react-native';
import debounce from 'lodash/debounce';

const SearchScreen = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Debounced search function to prevent excessive API calls
    const searchUsers = useCallback(
        debounce(async (query) => {
            if (!query.trim()) {
                setUsers([]);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`http://192.168.132.183:4000/search-users?username=${encodeURIComponent(query)}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();

                console.log('Search Response:', data);

                if (data.success) {
                    if (data.users.length === 0) {
                        Alert.alert('No Results', 'No users found matching your search');
                    }
                    setUsers(data.users);
                } else {
                    Alert.alert('Error', data.message || 'Failed to search users');
                    setError('Failed to search users');
                }
            } catch (err) {
                console.error('Search error:', err);
                Alert.alert('Error', 'An error occurred while searching');
                setError('An error occurred while searching');
            } finally {
                setLoading(false);
            }
        }, 300),
        []
    );

    // Use effect to trigger search when query changes
    useEffect(() => {
        if (searchQuery) {
            searchUsers(searchQuery);
        } else {
            setUsers([]);
        }
    }, [searchQuery, searchUsers]);

    const navigateToProfile = (userId, username) => {
        navigation.navigate('ProfileView', { 
            userId: userId,
            username: username 
        });
    };

    const renderUserItem = ({ item }) => (
        <View 
            style={{
                flexDirection: 'row',
                padding: 15,
                alignItems: 'center',
                borderBottomWidth: 1,
                borderBottomColor: '#e0e0e0'
            }}
        >
            <TouchableOpacity 
                onPress={() => navigateToProfile(item.userId, item.username)}
                style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
            >
                <Image 
                    source={{ 
                        uri: item.profilePhotoUrl || '/api/placeholder/50/50' 
                    }} 
                    style={{ 
                        width: 50, 
                        height: 50, 
                        borderRadius: 25, 
                        marginRight: 15 
                    }} 
                />
                <View style={{ flex: 1 }}>
                    <TouchableOpacity 
                        onPress={() => navigateToProfile(item.userId, item.username)}
                    >
                        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                            {item.username}
                        </Text>
                    </TouchableOpacity>
                    <Text style={{ color: '#666', fontSize: 14 }}>{item.name}</Text>
                    <Text 
                        style={{ color: '#888', fontSize: 12 }} 
                        numberOfLines={1}
                    >
                        {item.bio}
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
            <View style={{ 
                flexDirection: 'row', 
                padding: 10, 
                backgroundColor: '#f0f0f0', 
                alignItems: 'center' 
            }}>
                <TextInput
                    style={{ 
                        flex: 1, 
                        backgroundColor: 'white', 
                        borderRadius: 10, 
                        padding: 10,
                        borderWidth: 1,
                        borderColor: '#e0e0e0'
                    }}
                    placeholder="Search users..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {loading && (
                <Text style={{ 
                    textAlign: 'center', 
                    marginTop: 20, 
                    color: '#888' 
                }}>
                    Loading...
                </Text>
            )}

            {error && (
                <Text style={{ 
                    color: 'red', 
                    textAlign: 'center', 
                    marginTop: 20 
                }}>
                    {error}
                </Text>
            )}

            <FlatList
                data={users}
                renderItem={renderUserItem}
                keyExtractor={(item) => item.userId}
                ListEmptyComponent={
                    <Text style={{ 
                        textAlign: 'center', 
                        marginTop: 20, 
                        color: '#888' 
                    }}>
                        {searchQuery ? 'No users found' : 'Search for users'}
                    </Text>
                }
            />
        </View>
    );
};

export default SearchScreen;