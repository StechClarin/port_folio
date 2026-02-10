import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const usePortfolioData = () => {
    const [data, setData] = useState({
        profile: null,
        projects: [],
        experience: [],
        education: [],
        skills: {}, // grouped by category
        socials: {}, // object with platform keys or array
        loading: true,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [
                    { data: projects },
                    { data: experiences },
                    { data: education },
                    { data: allSkills }, // from 'technologies' or 'skills' table? Using 'technologies' for consistency if that's what we populated
                    { data: socials }
                ] = await Promise.all([
                    supabase.from('projects').select('*').order('display_order', { ascending: true }),
                    supabase.from('experiences').select('*').order('display_order', { ascending: true }),
                    supabase.from('education').select('*').order('display_order', { ascending: true }),
                    supabase.from('skills').select('*').order('display_order', { ascending: true }),
                    supabase.from('socials').select('*').order('display_order', { ascending: true })
                ]);

                // Process Skills into Categories
                const skillsObj = {
                    languages: [],
                    frameworks: [],
                    tools: [],
                    other: []
                };

                if (allSkills) {
                    allSkills.forEach(skill => {
                        const cat = skill.category?.toLowerCase() || 'other';
                        if (skillsObj[cat]) {
                            skillsObj[cat].push(skill.name);
                        } else if (cat.includes('language')) {
                            skillsObj.languages.push(skill.name);
                        } else if (cat.includes('framework')) {
                            skillsObj.frameworks.push(skill.name);
                        } else if (cat.includes('tool') || cat.includes('devops')) {
                            skillsObj.tools.push(skill.name);
                        } else {
                            // create new category bucket if needed or push to other
                            if (!skillsObj[cat]) skillsObj[cat] = [];
                            skillsObj[cat].push(skill.name);
                        }
                    });
                }

                // Process Socials into Object (email, linkedin, etc)
                const socialsObj = {};
                if (socials) {
                    socials.forEach(s => {
                        socialsObj[s.platform.toLowerCase()] = s.url;
                    });
                }

                // Use static profile for now if not in DB, or fetch if available. 
                // We'll stick to the structure expected by components.

                setData({
                    projects: projects || [],
                    experience: experiences || [],
                    education: education || [],
                    skills: skillsObj,
                    socials: socialsObj,
                    loading: false
                });

            } catch (error) {
                console.error("Error fetching portfolio data:", error);
                setData(prev => ({ ...prev, loading: false }));
            }
        };

        fetchData();
    }, []);

    return data;
};

export default usePortfolioData;
