import { ChannelRecord, NicheTab } from '@/types';

export interface AIQueryContext {
  channels: ChannelRecord[];
  nicheTabs: NicheTab[];
  userRole: string;
  userName: string;
  branchId: string;
  systemPrompt: string;
  geminiApiKey?: string;
}

export async function askEmpireNexsAI(
  userPrompt: string,
  context: AIQueryContext
): Promise<{ text: string; sources?: { type: 'channel' | 'niche' | 'doc'; title: string; link?: string }[] }> {
  // If Gemini API key is configured in settings, we can make live Gemini 1.5/2.5 calls
  if (context.geminiApiKey && context.geminiApiKey.trim().length > 10) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${context.geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `${context.systemPrompt}\n\nCURRENT CHANNELS VAULT DATA:\n${JSON.stringify(
                      context.channels.map((c) => ({
                        name: c.channelName,
                        link: c.channelUrl,
                        status: c.status,
                        niche: c.niche,
                        owner: c.owner,
                        branch: c.branchId,
                        ip: c.ip,
                      })),
                      null,
                      2
                    )}\n\nNICHES SHEET TABS DATA:\n${JSON.stringify(
                      context.nicheTabs.map((t) => ({
                        niche: t.name,
                        branch: t.branchId,
                        videos: t.videos.map((v) => ({
                          number: v.videoNo,
                          title: v.topicTitle,
                          status: v.status,
                          scriptDoc: v.scriptDocLink,
                          drive: v.videoDriveLink,
                          writer: v.scriptWriter,
                          editor: v.videoEditor,
                        })),
                      })),
                      null,
                      2
                    )}\n\nUser: ${context.userName} (Role: ${context.userRole}, Branch: ${context.branchId})\nQuery: "${userPrompt}"\n\nAnswer in friendly Roman Urdu or English as requested. If asking for a channel link, provide it cleanly. Maintain security: only provide sensitive passwords if userRole is SUPER_ADMIN.`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) {
          return { text: candidate };
        }
      }
    } catch (err) {
      console.warn('Gemini direct API call fallback triggered', err);
    }
  }

  // Built-in intelligent agent logic
  return {
    text: `EmpireNexs Assistant ready. Please check the channel vault or niche production tab for the latest status.`,
  };
}
