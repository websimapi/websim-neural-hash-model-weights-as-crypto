/**
 * Interface for WebsimSocket to persist our "Blockchain" of commits.
 */

const ROOM = new WebsimSocket();
const COLLECTION = 'neural_commits_v1';

export class StorageService {
    static getCollection() {
        return ROOM.collection(COLLECTION);
    }

    static async createCommitment(data, fingerprint, nonce, analysis) {
        const currentUser = await window.websim.getCurrentUser();
        
        return await ROOM.collection(COLLECTION).create({
            raw_data: data,
            fingerprint: fingerprint,
            nonce: nonce,
            analysis: analysis,
            verified: null, // null = unknown, true = pass, false = fail
            last_checked: null,
            owner_id: currentUser.id
        });
    }

    static subscribeToCommits(callback) {
        // Subscribe to all commits
        return ROOM.collection(COLLECTION).subscribe((records) => {
            // Sort by newest first
            const sorted = records.sort((a, b) => 
                new Date(b.created_at) - new Date(a.created_at)
            );
            callback(sorted);
        });
    }
    
    static async deleteCommit(id) {
        return await ROOM.collection(COLLECTION).delete(id);
    }
}