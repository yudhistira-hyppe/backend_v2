import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Guideline, GuidelineDocument } from './schemas/guideline.schema';
import { UtilsService } from 'src/utils/utils.service';
import { ModuleService } from '../usermanagement/module/module.service';

@Injectable()
export class GuidelineService {
    constructor(
        @InjectModel(Guideline.name, 'SERVER_FULL')
        private readonly guidelineModel: Model<GuidelineDocument>,
        private readonly utilsService: UtilsService,
        private readonly moduleService: ModuleService
    ) { }

    async findById(id: string): Promise<Guideline> {
        return this.guidelineModel.findById(id);
    }
    async findByName(name: string): Promise<Guideline> {
        return this.guidelineModel.findOne({ name: name });
    }
    async create(CreateGuidelineDto: any, username: string): Promise<Guideline> {
        let data = await this.guidelineModel.create(CreateGuidelineDto);
        if (CreateGuidelineDto.status == "SUBMITTED") {
            // CreateGuidelineDto.redirectUrl += CreateGuidelineDto._id;
            let lookupData = await this.moduleService.listModuleGroupUsers("community_support");
            // let lookupData = [{
            //     userdata: [
            //         {
            //             fullName: "Haris Dwi Prakoso",
            //             email: "harisdwi.prakoso@gmail.com"
            //         },
            //     ]
            // }]
            for (let user of lookupData[0].userdata) {
                await this.utilsService.sendEmail(user.email, "no-reply@hyppe.app", "Permintaan Persetujuan Perubahan Panduan Komunitas", `<!DOCTYPE html>
                <html>
                
                <head>
                    <meta http-equiv="content-type" content="text/html; charset=windows-1252">
                    <link href="http://fonts.googleapis.com/css?family=Lato:400,700" rel="stylesheet" type="text/css">
                    <style>
                        .myButton {
                            background-color: #b70f90;
                            -webkit-border-radius: 5px;
                            -moz-border-radius: 5px;
                            border-radius: 5px;
                            border: 1px solid #9a0a78;
                            display: block;
                            cursor: pointer;
                            color: #fff;
                            font-family: Lato;
                            font-size: 12px;
                            font-weight: 700;
                            padding: 8px 50px;
                            text-decoration: none;
                            text-align: center;
                            margin: auto;
                        }
                
                        .myButton:hover {
                            background-color: #a3007d
                        }
                
                        .myButton:active {
                            position: relative;
                            top: 1px
                        }
                    </style>
                </head>
                
                <body style="font-family:Lato">
                    <p></p>
                    <table style="border-collapse:collapse" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#f1f1f1">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="email-container" style="height:351px;width:560px;margin:0 auto" width="340"
                                        cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff" align="center">
                                        <tbody>
                                            <tr style="height:71px">
                                                <td
                                                    style="padding:0;text-align:left;font-size:15px;line-height:20px;color:#333;height:56px;width:318px;background-color:#eee">
                                                    <img src="data:image/png;base64,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"
                                                        style="display:block;margin-left:15px;">
                                                </td>
                                                <td
                                                    style="color:#BABABA;padding:0;text-align:right;font-size:15px;line-height:20px;height:56px;width:318px;background-color:#eee;padding-right:15px;">
                                                    #monetizeyouridea </td>
                                            </tr>
                                            <tr>
                                                <td dir="ltr" colspan=2
                                                    style="padding:0 15px 0 15px;text-align:left;line-height:20px;width:318px;background-color:#f1f1f1"
                                                    valign="top" align="left">
                                                    <table
                                                        style="margin-bottom:20px;padding-bottom:40px;font-size:14px;width:100%;border-collapse:separate;border-spacing:0;border-top:45px solid #fff;border-right:45px solid #fff;border-left:45px solid #fff;border-image:initial;border-radius:20px 20px 20px 20px;border-bottom:none;background-color:#fff"
                                                        width="100%" border="0">
                                                        <tbody>
                                                            <tr>
                                                                <td style="padding-top:10px;padding-bottom:0;text-align:left">
                                                                    <p style="font-size:22px"> <strong>Hi&nbsp; <span
                                                                                id="fullname">${user.fullName}</span>&nbsp;, </strong>
                                                                        <br><span id="username"
                                                                            style="font-size:14px">${user.email}</span>
                                                                    </p>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td>
                                                                    <p style="font-size:18px; font-weight:bold">Terdapat permintaan
                                                                        perubahan panduan komunitas yang menunggu untuk disetujui</p>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td>
                                                                    <p style="font-size:18px; font-weight:bold">Informasi pengguna</p>
                                                                </td>
                                                            </tr>
                                                            <tr id="transactionOwnership">
                                                                <td>
                                                                    <table style="margin-top:10px" width="100%">
                                                                        <tbody>
                                                                            <tr style="line-height:30px;font-size:14px">
                                                                                <td width="40%">Judul</td>
                                                                                <td width="60%" style="font-weight: bold;">:&nbsp; <span
                                                                                        id="typeTransactionForOwnership"
                                                                                        style="font-size:14px">${CreateGuidelineDto.name}</span> </td>
                                                                            </tr>
                                                                            <tr style="line-height:30px;font-size:14px">
                                                                                <td width="40%">Diajukan oleh</td>
                                                                                <td width="60%" style="font-weight: bold;">:&nbsp; <span
                                                                                        id="postTypeOwnership"
                                                                                        style="font-size:14px">${username}</span> </td>
                                                                            </tr>
                                                                            <tr style="line-height:30px;font-size:14px">
                                                                                <td>Waktu pengajuan</td>
                                                                                <td style="font-weight: bold;">:&nbsp; <span
                                                                                        id="tanggalPemesananOwnership"
                                                                                        style="font-size:14px">${CreateGuidelineDto.updatedAt}</span> </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td id="hrTransaction">
                                                                    <hr style="border: 1px solid #D2D2D2;">
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td>
                                                                    <table style="margin-top:10px; margin-bottom:10px;" width="100%">
                                                                        <tbody>
                                                                            <tr style="line-height:30px;font-size:14px">
                                                                                <td width="40%">Catatan perubahan</td>
                                                                                <td width="60%" style="font-weight: bold;">:&nbsp; <span
                                                                                        id="postType" style="font-size:14px">${CreateGuidelineDto.remark ? CreateGuidelineDto.remark : "-"}</span>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td id="hrTransaction">
                                                                    <hr style="border: 1px solid #D2D2D2;">
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td>
                                                                    <table style="margin-top:10px;" width="100%">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td>
                                                                                    <a id="otpbutton" href=${CreateGuidelineDto.redirectUrl} class="myButton">Buka
                                                                                        Hyppe
                                                                                        Console</a>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td colspan=2
                                                    style="padding:0 15px 15px;text-align:left;font-size:15px;line-height:20px;color:#333;height:76px;width:318px;background-color:#f1f1f1">
                                                    <table
                                                        style="background-color:#fff;font-size:15px;height:66px;width:100%;border-collapse:separate;border-spacing:0;border:45px solid #fff;border-radius:45px;-moz-border-radius:20px;-webkit-border-radius:20px;border-top:20px;border-top-left-radius:20px;border-top-right-radius:20px"
                                                        width="100%" border="0">
                                                        <tbody>
                                                            <tr>
                                                                <td style="width:100%;padding-top:8px;font-size:14px">
                                                                    <table style="background-color:#fff;font-size:14px" width="100%"
                                                                        border="0">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td style="padding-top:20px;font-size:14px"
                                                                                    width="100%"> <span
                                                                                        style="font-size:16px;font-weight:bold;">
                                                                                        <b>Dapatkan aplikasi Hyppe</b> </span>
                                                                                    <p>Maksimalkan Hyppe dengan menginstal aplikasi.
                                                                                        Kamu dapat login dengan menggunakan alamat email
                                                                                        dan kata sandi yang ada.</p>
                                                                                </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td>
                                                                                    <table>
                                                                                        <tbody>
                                                                                            <tr>
                                                                                                <td> <a href="#"> <img
                                                                                                            style="margin-right:5px"
                                                                                                            src="https://s1.hyppe.cloud/api/utils/images/logo-playstore.jpg">
                                                                                                    </a> </td>
                                                                                                <td> <a href="#"> <img
                                                                                                            style="margin-left:5px"
                                                                                                            src="https://s1.hyppe.cloud/api/utils/images/logo-appstore.jpg">
                                                                                                    </a> </td>
                                                                                            </tr>
                                                                                        </tbody>
                                                                                    </table>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td colspan=2
                                                    style="padding:0 15px 15px;text-align:left;font-size:15px;line-height:20px;color:#333;height:76px;width:318px;background-color:#f1f1f1">
                                                    <table style="font-size:15px;height:162px;width:100%" width="100%" border="0">
                                                        <tbody>
                                                            <tr style="height:22px">
                                                                <td style="height:22px" width="100%">
                                                                    <table style="margin:auto" width="70%" border="0">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td style="text-align:center" width="10%"> <img
                                                                                        src="https://s1.hyppe.cloud/api/utils/images/logo-facebook.png"
                                                                                        style="height:25px;width:24px"> </td>
                                                                                <td style="text-align:center" width="10%"> <img
                                                                                        src="https://s1.hyppe.cloud/api/utils/images/logo-youtube.png"
                                                                                        style="height:20px;width:27px"> </td>
                                                                                <td style="text-align:center" width="10%"> <img
                                                                                        src="https://s1.hyppe.cloud/api/utils/images/logo-instagram.png"
                                                                                        style="height:21px;width:19px"> </td>
                                                                                <td style="text-align:center" width="10%"> <img
                                                                                        src="https://s1.hyppe.cloud/api/utils/images/logo-twitter.png"
                                                                                        style="height:22px;width:19px"> </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                            <tr style="height:57px">
                                                                <td style="height:57px">
                                                                    <table style="margin:0 auto;height:44px;width:52.0603%" width="70%"
                                                                        border="0">
                                                                        <tbody>
                                                                            <tr style="height:22px">
                                                                                <td style="height:22px;width:10%;text-align: center;"
                                                                                    width="10%"> <img
                                                                                        src="https://s1.hyppe.cloud/api/utils/images/fi_phone.png">
                                                                                    <span style="font-size:12px">(021) 2506691</span>
                                                                                    <br> <img
                                                                                        src="https://s1.hyppe.cloud/api/utils/images/fi_mail.png">
                                                                                    <span
                                                                                        style="font-size:12px;text-decoration:underline;color:#1da1f2">care@hyppe.app</span>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                            <tr style="height:61px">
                                                                <td style="text-align:center;font-size:12px;line-height:15px"
                                                                    width="100%">Topas Tower, Lt 8, Jl. Jend. Sudirman Kav. 26, Karet
                                                                    Kuningan Setiabudi, Jakarta Selatan, DKI Jakarta 12920</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </body>
                
                </html>`)
            }
        };
        if (!data) throw new Error('Todo is not found');
        return data;
    }
    async delete(id: string): Promise<Guideline> {
        let data = await this.guidelineModel.findByIdAndUpdate(id, {
            isActive: false,
            updatedAt: await this.utilsService.getDateTimeString(),
            isDeleted: true
        }, { new: true });
        if (!data) throw new Error('Todo is not found');
        return data;
    }
    async update(id: string, CreateGuidelineDto: any, username: string): Promise<Guideline> {
        // let data_old = await this.guidelineModel.findByIdAndUpdate(id, { isActive: false }, { new: true });
        let data_old = await this.guidelineModel.findById(id);
        if (!data_old) throw new Error('Old todo is not found');
        else {
            CreateGuidelineDto.createdAt = data_old.createdAt;
            CreateGuidelineDto.createdBy = data_old.createdBy;
            CreateGuidelineDto.isActive = true;
            CreateGuidelineDto.approvedBy = null;
            let data
            if (data_old.status == "DRAFT") {
                if (CreateGuidelineDto.status == "SUBMITTED") {
                    CreateGuidelineDto.redirectUrl += id;
                    let lookupData = await this.moduleService.listModuleGroupUsers("community_support");
                    // let lookupData = [{
                    //     userdata: [
                    //         {
                    //             fullName: "Haris Dwi Prakoso",
                    //             email: "harisdwi.prakoso@gmail.com"
                    //         },
                    //     ]
                    // }]
                    for (let user of lookupData[0].userdata) {
                        await this.utilsService.sendEmail(user.email, "no-reply@hyppe.app", "Permintaan Persetujuan Perubahan Panduan Komunitas", `<!DOCTYPE html>
                        <html>
                        
                        <head>
                            <meta http-equiv="content-type" content="text/html; charset=windows-1252">
                            <link href="http://fonts.googleapis.com/css?family=Lato:400,700" rel="stylesheet" type="text/css">
                            <style>
                                .myButton {
                                    background-color: #b70f90;
                                    -webkit-border-radius: 5px;
                                    -moz-border-radius: 5px;
                                    border-radius: 5px;
                                    border: 1px solid #9a0a78;
                                    display: block;
                                    cursor: pointer;
                                    color: #fff;
                                    font-family: Lato;
                                    font-size: 12px;
                                    font-weight: 700;
                                    padding: 8px 50px;
                                    text-decoration: none;
                                    text-align: center;
                                    margin: auto;
                                }
                        
                                .myButton:hover {
                                    background-color: #a3007d
                                }
                        
                                .myButton:active {
                                    position: relative;
                                    top: 1px
                                }
                            </style>
                        </head>
                        
                        <body style="font-family:Lato">
                            <p></p>
                            <table style="border-collapse:collapse" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#f1f1f1">
                                <tbody>
                                    <tr>
                                        <td>
                                            <table class="email-container" style="height:351px;width:560px;margin:0 auto" width="340"
                                                cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff" align="center">
                                                <tbody>
                                                    <tr style="height:71px">
                                                        <td
                                                            style="padding:0;text-align:left;font-size:15px;line-height:20px;color:#333;height:56px;width:318px;background-color:#eee">
                                                            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHkAAAAgCAYAAAA2e9d2AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAgbSURBVHgB7VtdUhtHEO4eLak82M76LVUx9vLj5+ATWJzAyDZU8WRxAsMJLJ0AOAH4KSn/ROIEiBOAnwPW2DhVeUOpxC9Bmk73alfMrnZXKySwXdFXhbTane2dmZ7u/rpnQYih5tXctoLnBFBGAC84fUQIWgHVCx08KOmShgm+GaD9gxXstRH2+ayXdRMrvI4I28vHpQZM8NUjouTXM7WmpeAWEFswWzOmK10jUuXpyeOXMMFXi56SX3lvy6jUjhyzYnXHwOJq4JZfz9Yq/PUiQ44GQ+vL+vEejAl3Z+8/JzLr3MWjv6m91tK6BRNcCj0l21aMqMpPTx5FrJMVfcZf7gBhuwUD1VFj9k/e/QWFdNiTS1D9qI8rMMGloOSDY/GCHYepA/1Wg3AEAyBkjUnb4a+zb9dhBCBQZDGRonswwaXhK5kVU7RPojJL9m8hZKzBIuSDWwC1yZ5h379vgi8ORz7YHT4ki4KJRb6ZrYFBc4Ck7rUBhrdMhKIw9VderbSiSwO9wARXB1/JpDjWUvSCnyeTKsNo8JDd95u5vb4YPyzuePNFULSEhD+H5/i4/i+c7/2ptU66Z9qbW2KC8Ywbts5Np5rWTvCj53lT6GzyoWsIN/7QvycuTNfz3FvKYVIICxBwFEJ6xxZR/6SPG5ADvgyYesb3FUeWocwC3+z5J5GYAMPeqT6p2219+81DqgjMNhpVX9bd3Pi1Vytyx8ook5gDSWQuDaJQlHz9Aq2s/nHbysf3x1X7HOvM7aBz1us/0fYnfZLqkaZn5uV5xfB5p83j2/b1QLkvWLnpXg1pd9Bi6mYNVIHU8ZA+p87iqDIMqVK4UFU4BsiAQlhbef9kPVSwQI5Xmo/LfFiFHOB0aOuVELzLIXsBElQCJaXeg3DhAVKkeGn3ioJvoLOfqWBfBJansLAvXiHp8vTs3A4rZwsyx4PiUQ4lw0i6emd2/kUeGZKd3J2b8w1Q/TKQHJnqk5PSbtrV5felCj80j4W6bHGbcHUoTs/OX4n8m1jYYpeXc4Gi56BTi58V5cgigHxwFZqaLC77JIcfDqFQySkDyOCWLDg1qGHbqN1BbTg2DmzTbQhFcfNwWbA7ZGtaLBA+YPNdE7cUuc6W5sfuMaIrLxqSuA+Nbj/aM/INsUUuC+KuN18Jf8tEx5VDsh8QyAjGEzMU9G6BE/UcGC9Ikea5Xw9lSEiKXgeXvcKOA1ngwazmKGyI6+a4nhk3eyK76VkDhoRfEGmeVKxTRzx3dSNuNGJldCn5qc9l3hGr/go5Klm/tTzvjjfXYn7yvNcLhIfhsQNOOSqVtMNxV0ereGVeGLIRtGnJEHkVORYrFsXbMgq+jBPd5Qv0jBXex49IvAJ8EyCdVPGSSTIEG5GTiA9hjIjHcraajaR2DnQqCJEiUjF0t2gpXECEazqhTMtjlFjbsE65YWymWLgQz8ACWnc5DNxEp0ldTxEzMllMuKYGjDBXHAqKHgOtWKCYVMCwIHyXdimecsSrZaMiNrlcQk9mvaI0ccH2Obc3JxFSB1lpErvcyFgVGL/ax14istgIsczKPUtSbhhOTpsnM5oZ9iBLdvPE0I5SjyAHZOPjvGMOYFgoOoMRwa5vrMofBXFCZYOVGSnhEuBfwWHc8ovxe0Pl8iJatBeS+h4S6tQ2FOxklSflGufQFcgBdmfbq9f3wkEr9mwvbXK7KQ96afdacNOIXZA2Ra6lWX0foQqF+/2jiPd0oK3lmy38A6QgrlzJoyVdC1294h2jFmQr2uPa9v5r77c+a5XtSdmQgDyEi4spnG5twTUhiHkN65TL7m0n3k4mti/lQaqniBUithPPgxNlEKRuuwqhiufBIuOmKmzGydXFQsGkPrXiltvLozld41x53+9b0KEWZLszj4NpnRm05naa3W4LuxsWuVyg5NErzSfrcM3gCagy6Slap5amZ+aaQloM4AfFpIpQ9qyjL0VwfpmR9/vFiiZbyi63+8ChxA1YbWQuWH4lXYbkwXTIBZw69/FdTwbFCjhW2iVK5PYNiHoLqT28CEq+LAMesQzPvn4DnIXuBgV03wCBwfBECEJ+iAV/CQULkicGPbakXfT7JgX76GiC8mdjoHC2FPSF9M+GpHtpte8YlljGUpIMqQlwyhhZbMzs1zhlPKTogir6CzlJBnsCGYvq9heGJ0ODIe5yQ8qhcMXAjHDDE1NCgDwT7sc2SYVgBMgiGfUFB+lHwXT6UjVx3Ypwsa8IlCSDxyx5tBx32bXJNwn5ewmNtoEHl43BTDaO7IEYo7az2hurWsRuL7L6JTYrai8mVINsSGyrSmzT2a8ZyXtvjaQLfP8Rf5SyNkGsxmnhwM/7s/ohKZGvvAwZMhaHxxzG84vXf3LsROWAdKw6LoIlW4UF6DR0jve7QtablYMyX/I6UKiAvXPGblGsJu0Z7O6tTVjSknsGchZMMF9ToI50hnsWHmATKt7hwmFlpIzHbXPMpSAP58KNFgOJj6VX1uSHbavsl/UyIbH3s1GVtS5bHwvi+6JZyLMPKyubF4O2o5cxcHA65EuCgYVoGAFjkhHPIBLRU/J3BrbkpXoY1prFNROsreonGib4KtGreEm+TAY2ct8pscnA4nKztLj6P/mPCq4+jc1LXSciZc0VXdpFAyUO3DqhrU86ENT6PwZui3Ltlwi+FXDM2r1g46SnOOZn3mARHJVR4MgWcUEGCcZMcnMgNeWVmjUGrpvjtf7Mf+OMt18SIekZJ6kbBH/DH9QPCs5f6sk/CkwwwQQTTNCP/wCcyBoD0QlJ7wAAAABJRU5ErkJggg=="
                                                                style="display:block;margin-left:15px;">
                                                        </td>
                                                        <td
                                                            style="color:#BABABA;padding:0;text-align:right;font-size:15px;line-height:20px;height:56px;width:318px;background-color:#eee;padding-right:15px;">
                                                            #monetizeyouridea </td>
                                                    </tr>
                                                    <tr>
                                                        <td dir="ltr" colspan=2
                                                            style="padding:0 15px 0 15px;text-align:left;line-height:20px;width:318px;background-color:#f1f1f1"
                                                            valign="top" align="left">
                                                            <table
                                                                style="margin-bottom:20px;padding-bottom:40px;font-size:14px;width:100%;border-collapse:separate;border-spacing:0;border-top:45px solid #fff;border-right:45px solid #fff;border-left:45px solid #fff;border-image:initial;border-radius:20px 20px 20px 20px;border-bottom:none;background-color:#fff"
                                                                width="100%" border="0">
                                                                <tbody>
                                                                    <tr>
                                                                        <td style="padding-top:10px;padding-bottom:0;text-align:left">
                                                                            <p style="font-size:22px"> <strong>Hi&nbsp; <span
                                                                                        id="fullname">${user.fullName}</span>&nbsp;, </strong>
                                                                                <br><span id="username"
                                                                                    style="font-size:14px">${user.email}</span>
                                                                            </p>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>
                                                                            <p style="font-size:18px; font-weight:bold">Terdapat permintaan
                                                                                perubahan panduan komunitas yang menunggu untuk disetujui</p>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>
                                                                            <p style="font-size:18px; font-weight:bold">Informasi pengguna</p>
                                                                        </td>
                                                                    </tr>
                                                                    <tr id="transactionOwnership">
                                                                        <td>
                                                                            <table style="margin-top:10px" width="100%">
                                                                                <tbody>
                                                                                    <tr style="line-height:30px;font-size:14px">
                                                                                        <td width="40%">Judul</td>
                                                                                        <td width="60%" style="font-weight: bold;">:&nbsp; <span
                                                                                                id="typeTransactionForOwnership"
                                                                                                style="font-size:14px">${data_old.name}</span> </td>
                                                                                    </tr>
                                                                                    <tr style="line-height:30px;font-size:14px">
                                                                                        <td width="40%">Diajukan oleh</td>
                                                                                        <td width="60%" style="font-weight: bold;">:&nbsp; <span
                                                                                                id="postTypeOwnership"
                                                                                                style="font-size:14px">${username}</span> </td>
                                                                                    </tr>
                                                                                    <tr style="line-height:30px;font-size:14px">
                                                                                        <td>Waktu pengajuan</td>
                                                                                        <td style="font-weight: bold;">:&nbsp; <span
                                                                                                id="tanggalPemesananOwnership"
                                                                                                style="font-size:14px">${CreateGuidelineDto.updatedAt}</span> </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td id="hrTransaction">
                                                                            <hr style="border: 1px solid #D2D2D2;">
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>
                                                                            <table style="margin-top:10px; margin-bottom:10px;" width="100%">
                                                                                <tbody>
                                                                                    <tr style="line-height:30px;font-size:14px">
                                                                                        <td width="40%">Catatan perubahan</td>
                                                                                        <td width="60%" style="font-weight: bold;">:&nbsp; <span
                                                                                                id="postType" style="font-size:14px">${data_old.remark ? data_old.remark : "-"}</span>
                                                                                        </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td id="hrTransaction">
                                                                            <hr style="border: 1px solid #D2D2D2;">
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>
                                                                            <table style="margin-top:10px;" width="100%">
                                                                                <tbody>
                                                                                    <tr>
                                                                                        <td>
                                                                                            <a id="otpbutton" href=${CreateGuidelineDto.redirectUrl} class="myButton">Buka
                                                                                                Hyppe
                                                                                                Console</a>
                                                                                        </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td colspan=2
                                                            style="padding:0 15px 15px;text-align:left;font-size:15px;line-height:20px;color:#333;height:76px;width:318px;background-color:#f1f1f1">
                                                            <table
                                                                style="background-color:#fff;font-size:15px;height:66px;width:100%;border-collapse:separate;border-spacing:0;border:45px solid #fff;border-radius:45px;-moz-border-radius:20px;-webkit-border-radius:20px;border-top:20px;border-top-left-radius:20px;border-top-right-radius:20px"
                                                                width="100%" border="0">
                                                                <tbody>
                                                                    <tr>
                                                                        <td style="width:100%;padding-top:8px;font-size:14px">
                                                                            <table style="background-color:#fff;font-size:14px" width="100%"
                                                                                border="0">
                                                                                <tbody>
                                                                                    <tr>
                                                                                        <td style="padding-top:20px;font-size:14px"
                                                                                            width="100%"> <span
                                                                                                style="font-size:16px;font-weight:bold;">
                                                                                                <b>Dapatkan aplikasi Hyppe</b> </span>
                                                                                            <p>Maksimalkan Hyppe dengan menginstal aplikasi.
                                                                                                Kamu dapat login dengan menggunakan alamat email
                                                                                                dan kata sandi yang ada.</p>
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td>
                                                                                            <table>
                                                                                                <tbody>
                                                                                                    <tr>
                                                                                                        <td> <a href="#"> <img
                                                                                                                    style="margin-right:5px"
                                                                                                                    src="https://s1.hyppe.cloud/api/utils/images/logo-playstore.jpg">
                                                                                                            </a> </td>
                                                                                                        <td> <a href="#"> <img
                                                                                                                    style="margin-left:5px"
                                                                                                                    src="https://s1.hyppe.cloud/api/utils/images/logo-appstore.jpg">
                                                                                                            </a> </td>
                                                                                                    </tr>
                                                                                                </tbody>
                                                                                            </table>
                                                                                        </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td colspan=2
                                                            style="padding:0 15px 15px;text-align:left;font-size:15px;line-height:20px;color:#333;height:76px;width:318px;background-color:#f1f1f1">
                                                            <table style="font-size:15px;height:162px;width:100%" width="100%" border="0">
                                                                <tbody>
                                                                    <tr style="height:22px">
                                                                        <td style="height:22px" width="100%">
                                                                            <table style="margin:auto" width="70%" border="0">
                                                                                <tbody>
                                                                                    <tr>
                                                                                        <td style="text-align:center" width="10%"> <img
                                                                                                src="https://s1.hyppe.cloud/api/utils/images/logo-facebook.png"
                                                                                                style="height:25px;width:24px"> </td>
                                                                                        <td style="text-align:center" width="10%"> <img
                                                                                                src="https://s1.hyppe.cloud/api/utils/images/logo-youtube.png"
                                                                                                style="height:20px;width:27px"> </td>
                                                                                        <td style="text-align:center" width="10%"> <img
                                                                                                src="https://s1.hyppe.cloud/api/utils/images/logo-instagram.png"
                                                                                                style="height:21px;width:19px"> </td>
                                                                                        <td style="text-align:center" width="10%"> <img
                                                                                                src="https://s1.hyppe.cloud/api/utils/images/logo-twitter.png"
                                                                                                style="height:22px;width:19px"> </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                    <tr style="height:57px">
                                                                        <td style="height:57px">
                                                                            <table style="margin:0 auto;height:44px;width:52.0603%" width="70%"
                                                                                border="0">
                                                                                <tbody>
                                                                                    <tr style="height:22px">
                                                                                        <td style="height:22px;width:10%;text-align: center;"
                                                                                            width="10%"> <img
                                                                                                src="https://s1.hyppe.cloud/api/utils/images/fi_phone.png">
                                                                                            <span style="font-size:12px">(021) 2506691</span>
                                                                                            <br> <img
                                                                                                src="https://s1.hyppe.cloud/api/utils/images/fi_mail.png">
                                                                                            <span
                                                                                                style="font-size:12px;text-decoration:underline;color:#1da1f2">care@hyppe.app</span>
                                                                                        </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                    <tr style="height:61px">
                                                                        <td style="text-align:center;font-size:12px;line-height:15px"
                                                                            width="100%">Topas Tower, Lt 8, Jl. Jend. Sudirman Kav. 26, Karet
                                                                            Kuningan Setiabudi, Jakarta Selatan, DKI Jakarta 12920</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </body>
                        
                        </html>`)
                    }
                };
                data = await this.guidelineModel.findByIdAndUpdate(id, CreateGuidelineDto, { new: true });
            } else if (data_old.status == "APPROVED") {
                CreateGuidelineDto.parentId = data_old._id;
                CreateGuidelineDto._id = new mongoose.Types.ObjectId();
                data = await this.guidelineModel.create(CreateGuidelineDto);
                if (CreateGuidelineDto.status == "SUBMITTED") {
                    CreateGuidelineDto.redirectUrl += CreateGuidelineDto._id;
                    let lookupData = await this.moduleService.listModuleGroupUsers("community_support");
                    for (let user of lookupData[0].userdata) {
                        await this.utilsService.sendEmail(user.email, "no-reply@hyppe.app", "Permintaan Persetujuan Perubahan Panduan Komunitas", `<!DOCTYPE html>
                        <html>
                        
                        <head>
                            <meta http-equiv="content-type" content="text/html; charset=windows-1252">
                            <link href="http://fonts.googleapis.com/css?family=Lato:400,700" rel="stylesheet" type="text/css">
                            <style>
                                .myButton {
                                    background-color: #b70f90;
                                    -webkit-border-radius: 5px;
                                    -moz-border-radius: 5px;
                                    border-radius: 5px;
                                    border: 1px solid #9a0a78;
                                    display: block;
                                    cursor: pointer;
                                    color: #fff;
                                    font-family: Lato;
                                    font-size: 12px;
                                    font-weight: 700;
                                    padding: 8px 50px;
                                    text-decoration: none;
                                    text-align: center;
                                    margin: auto;
                                }
                        
                                .myButton:hover {
                                    background-color: #a3007d
                                }
                        
                                .myButton:active {
                                    position: relative;
                                    top: 1px
                                }
                            </style>
                        </head>
                        
                        <body style="font-family:Lato">
                            <p></p>
                            <table style="border-collapse:collapse" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#f1f1f1">
                                <tbody>
                                    <tr>
                                        <td>
                                            <table class="email-container" style="height:351px;width:560px;margin:0 auto" width="340"
                                                cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff" align="center">
                                                <tbody>
                                                    <tr style="height:71px">
                                                        <td
                                                            style="padding:0;text-align:left;font-size:15px;line-height:20px;color:#333;height:56px;width:318px;background-color:#eee">
                                                            <img src="data:image/png;base64,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"
                                                                style="display:block;margin-left:15px;">
                                                        </td>
                                                        <td
                                                            style="color:#BABABA;padding:0;text-align:right;font-size:15px;line-height:20px;height:56px;width:318px;background-color:#eee;padding-right:15px;">
                                                            #monetizeyouridea </td>
                                                    </tr>
                                                    <tr>
                                                        <td dir="ltr" colspan=2
                                                            style="padding:0 15px 0 15px;text-align:left;line-height:20px;width:318px;background-color:#f1f1f1"
                                                            valign="top" align="left">
                                                            <table
                                                                style="margin-bottom:20px;padding-bottom:40px;font-size:14px;width:100%;border-collapse:separate;border-spacing:0;border-top:45px solid #fff;border-right:45px solid #fff;border-left:45px solid #fff;border-image:initial;border-radius:20px 20px 20px 20px;border-bottom:none;background-color:#fff"
                                                                width="100%" border="0">
                                                                <tbody>
                                                                    <tr>
                                                                        <td style="padding-top:10px;padding-bottom:0;text-align:left">
                                                                            <p style="font-size:22px"> <strong>Hi&nbsp; <span
                                                                                        id="fullname">${user.fullName}</span>&nbsp;, </strong>
                                                                                <br><span id="username"
                                                                                    style="font-size:14px">${user.email}</span>
                                                                            </p>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>
                                                                            <p style="font-size:18px; font-weight:bold">Terdapat permintaan
                                                                                perubahan panduan komunitas yang menunggu untuk disetujui</p>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>
                                                                            <p style="font-size:18px; font-weight:bold">Informasi pengguna</p>
                                                                        </td>
                                                                    </tr>
                                                                    <tr id="transactionOwnership">
                                                                        <td>
                                                                            <table style="margin-top:10px" width="100%">
                                                                                <tbody>
                                                                                    <tr style="line-height:30px;font-size:14px">
                                                                                        <td width="40%">Judul</td>
                                                                                        <td width="60%" style="font-weight: bold;">:&nbsp; <span
                                                                                                id="typeTransactionForOwnership"
                                                                                                style="font-size:14px">${data_old.name}</span> </td>
                                                                                    </tr>
                                                                                    <tr style="line-height:30px;font-size:14px">
                                                                                        <td width="40%">Diajukan oleh</td>
                                                                                        <td width="60%" style="font-weight: bold;">:&nbsp; <span
                                                                                                id="postTypeOwnership"
                                                                                                style="font-size:14px">${username}</span> </td>
                                                                                    </tr>
                                                                                    <tr style="line-height:30px;font-size:14px">
                                                                                        <td>Waktu pengajuan</td>
                                                                                        <td style="font-weight: bold;">:&nbsp; <span
                                                                                                id="tanggalPemesananOwnership"
                                                                                                style="font-size:14px">${CreateGuidelineDto.updatedAt}</span> </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td id="hrTransaction">
                                                                            <hr style="border: 1px solid #D2D2D2;">
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>
                                                                            <table style="margin-top:10px; margin-bottom:10px;" width="100%">
                                                                                <tbody>
                                                                                    <tr style="line-height:30px;font-size:14px">
                                                                                        <td width="40%">Catatan perubahan</td>
                                                                                        <td width="60%" style="font-weight: bold;">:&nbsp; <span
                                                                                                id="postType" style="font-size:14px">${data_old.remark ? data_old.remark : "-"}</span>
                                                                                        </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td id="hrTransaction">
                                                                            <hr style="border: 1px solid #D2D2D2;">
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>
                                                                            <table style="margin-top:10px;" width="100%">
                                                                                <tbody>
                                                                                    <tr>
                                                                                        <td>
                                                                                            <a id="otpbutton" href=${CreateGuidelineDto.redirectUrl} class="myButton">Buka
                                                                                                Hyppe
                                                                                                Console</a>
                                                                                        </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td colspan=2
                                                            style="padding:0 15px 15px;text-align:left;font-size:15px;line-height:20px;color:#333;height:76px;width:318px;background-color:#f1f1f1">
                                                            <table
                                                                style="background-color:#fff;font-size:15px;height:66px;width:100%;border-collapse:separate;border-spacing:0;border:45px solid #fff;border-radius:45px;-moz-border-radius:20px;-webkit-border-radius:20px;border-top:20px;border-top-left-radius:20px;border-top-right-radius:20px"
                                                                width="100%" border="0">
                                                                <tbody>
                                                                    <tr>
                                                                        <td style="width:100%;padding-top:8px;font-size:14px">
                                                                            <table style="background-color:#fff;font-size:14px" width="100%"
                                                                                border="0">
                                                                                <tbody>
                                                                                    <tr>
                                                                                        <td style="padding-top:20px;font-size:14px"
                                                                                            width="100%"> <span
                                                                                                style="font-size:16px;font-weight:bold;">
                                                                                                <b>Dapatkan aplikasi Hyppe</b> </span>
                                                                                            <p>Maksimalkan Hyppe dengan menginstal aplikasi.
                                                                                                Kamu dapat login dengan menggunakan alamat email
                                                                                                dan kata sandi yang ada.</p>
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td>
                                                                                            <table>
                                                                                                <tbody>
                                                                                                    <tr>
                                                                                                        <td> <a href="#"> <img
                                                                                                                    style="margin-right:5px"
                                                                                                                    src="https://s1.hyppe.cloud/api/utils/images/logo-playstore.jpg">
                                                                                                            </a> </td>
                                                                                                        <td> <a href="#"> <img
                                                                                                                    style="margin-left:5px"
                                                                                                                    src="https://s1.hyppe.cloud/api/utils/images/logo-appstore.jpg">
                                                                                                            </a> </td>
                                                                                                    </tr>
                                                                                                </tbody>
                                                                                            </table>
                                                                                        </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td colspan=2
                                                            style="padding:0 15px 15px;text-align:left;font-size:15px;line-height:20px;color:#333;height:76px;width:318px;background-color:#f1f1f1">
                                                            <table style="font-size:15px;height:162px;width:100%" width="100%" border="0">
                                                                <tbody>
                                                                    <tr style="height:22px">
                                                                        <td style="height:22px" width="100%">
                                                                            <table style="margin:auto" width="70%" border="0">
                                                                                <tbody>
                                                                                    <tr>
                                                                                        <td style="text-align:center" width="10%"> <img
                                                                                                src="https://s1.hyppe.cloud/api/utils/images/logo-facebook.png"
                                                                                                style="height:25px;width:24px"> </td>
                                                                                        <td style="text-align:center" width="10%"> <img
                                                                                                src="https://s1.hyppe.cloud/api/utils/images/logo-youtube.png"
                                                                                                style="height:20px;width:27px"> </td>
                                                                                        <td style="text-align:center" width="10%"> <img
                                                                                                src="https://s1.hyppe.cloud/api/utils/images/logo-instagram.png"
                                                                                                style="height:21px;width:19px"> </td>
                                                                                        <td style="text-align:center" width="10%"> <img
                                                                                                src="https://s1.hyppe.cloud/api/utils/images/logo-twitter.png"
                                                                                                style="height:22px;width:19px"> </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                    <tr style="height:57px">
                                                                        <td style="height:57px">
                                                                            <table style="margin:0 auto;height:44px;width:52.0603%" width="70%"
                                                                                border="0">
                                                                                <tbody>
                                                                                    <tr style="height:22px">
                                                                                        <td style="height:22px;width:10%;text-align: center;"
                                                                                            width="10%"> <img
                                                                                                src="https://s1.hyppe.cloud/api/utils/images/fi_phone.png">
                                                                                            <span style="font-size:12px">(021) 2506691</span>
                                                                                            <br> <img
                                                                                                src="https://s1.hyppe.cloud/api/utils/images/fi_mail.png">
                                                                                            <span
                                                                                                style="font-size:12px;text-decoration:underline;color:#1da1f2">care@hyppe.app</span>
                                                                                        </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                    <tr style="height:61px">
                                                                        <td style="text-align:center;font-size:12px;line-height:15px"
                                                                            width="100%">Topas Tower, Lt 8, Jl. Jend. Sudirman Kav. 26, Karet
                                                                            Kuningan Setiabudi, Jakarta Selatan, DKI Jakarta 12920</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </body>
                        
                        </html>`)
                    }
                }
            } else {
                CreateGuidelineDto.parentId = data_old._id;
                CreateGuidelineDto._id = new mongoose.Types.ObjectId();
                data_old = await this.guidelineModel.findByIdAndUpdate(id, { isActive: false }, { new: true });
                data = await this.guidelineModel.create(CreateGuidelineDto);
            }
            if (!data) throw new Error('Todo is not found');
            return data;
        }
    }
    async approve(id: string, approver: mongoose.Types.ObjectId): Promise<Guideline> {
        let now = await this.utilsService.getDateTimeString();
        let toApprove = await this.guidelineModel.findById(id);
        if (toApprove.status !== "APPROVED") {
            let data = await this.guidelineModel.findByIdAndUpdate(id,
                {
                    status: "APPROVED",
                    updatedAt: now,
                    approvedAt: now,
                    approvedBy: approver
                },
                { new: true }
            );
            if (toApprove.parentId && toApprove.parentId !== undefined) {
                await this.guidelineModel.findByIdAndUpdate(toApprove.parentId,
                    {
                        isActive: false,
                        updatedAt: now
                    })
            }
            if (!data) throw new Error('Todo is not found');
            return data;
        } else { throw new Error('Guideline is already approved'); }
    }
    async reject(id: string, rejecter: mongoose.Types.ObjectId): Promise<Guideline> {
        let now = await this.utilsService.getDateTimeString();
        let toReject = await this.guidelineModel.findById(id);
        if (toReject.status !== "REJECTED") {
            let data_old = await this.guidelineModel.findByIdAndUpdate(id,
                {
                    status: "REJECTED",
                    updatedAt: now,
                    rejectedAt: now,
                    rejectedBy: rejecter,
                    isActive: false
                },
                { new: true }
            );
            if (!data_old) throw new Error('Old todo is not found');
            let new_data = JSON.parse(JSON.stringify(data_old.toJSON()));
            new_data._id = new mongoose.Types.ObjectId();
            new_data.status = "DRAFT";
            new_data.isActive = true;
            let data = await this.guidelineModel.create(new_data);
            if (!data) throw new Error('Todo is not found');
            return data;
        } else { throw new Error('Guideline is already rejected'); }
    }
    async listAll(skip: number, limit: number, descending: boolean, language?: string, isActive?: boolean, name?: string, status?: string[]): Promise<any> {
        let order = descending ? -1 : 1;
        let pipeline = [];
        pipeline.push({
            "$sort":
            {
                'updatedAt': order
            }
        });
        if (isActive !== undefined) {
            pipeline.push({
                "$match":
                {
                    'isActive': isActive
                }
            });
        }
        if (name && name !== undefined) {
            pipeline.push({
                "$match":
                {
                    'name': new RegExp(name, "i")
                }
            });
        }
        if (language && language == 'en') {
            pipeline.push({
                "$match":
                {
                    'value_en': {
                        $ne: null
                    }
                }
            });
        } else if (language && language == 'id') {
            pipeline.push({
                "$match":
                {
                    'value_id': {
                        $ne: null
                    }
                }
            });
        }
        if (status && status.length > 0) {
            pipeline.push({
                "$match":
                {
                    'status': {
                        $in: status
                    }
                }
            });
        }
        pipeline.push(
            {
                "$lookup":
                {
                    from: 'newUserBasics',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'creator'
                },
            },
            {
                "$lookup":
                {
                    from: 'newUserBasics',
                    localField: 'approvedBy',
                    foreignField: '_id',
                    as: 'approver'
                },
            },
            {
                "$lookup":
                {
                    from: 'newUserBasics',
                    localField: 'rejectedBy',
                    foreignField: '_id',
                    as: 'rejecter'
                },
            },
            {
                "$project":
                {
                    _id: 1,
                    name: 1,
                    title_id: 1,
                    title_en: 1,
                    value_id: 1,
                    value_en: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    isActive: 1,
                    status: 1,
                    approvedAt: 1,
                    rejectedAt: 1,
                    creatorUsername: {
                        $arrayElemAt: ['$creator.username', 0]
                    },
                    creatorFullname: {
                        $arrayElemAt: ['$creator.fullName', 0]
                    },
                    creatorAvatar: {
                        mediaBasePath: {
                            $arrayElemAt: ['$creator.mediaBasePath', 0]
                        },
                        mediaUri: {
                            $arrayElemAt: ['$creator.mediaUri', 0]
                        },
                        mediaEndpoint: {
                            $arrayElemAt: ['$creator.mediaEndpoint', 0]
                        },
                    },
                    approverUsername: {
                        $arrayElemAt: ['$approver.username', 0]
                    },
                    approverFullname: {
                        $arrayElemAt: ['$approver.fullName', 0]
                    },
                    approverAvatar: {
                        mediaBasePath: {
                            $arrayElemAt: ['$approver.mediaBasePath', 0]
                        },
                        mediaUri: {
                            $arrayElemAt: ['$approver.mediaUri', 0]
                        },
                        mediaEndpoint: {
                            $arrayElemAt: ['$approver.mediaEndpoint', 0]
                        },
                    },
                    rejecterUsername: {
                        $arrayElemAt: ['$rejecter.username', 0]
                    },
                    rejecterFullname: {
                        $arrayElemAt: ['$rejecter.fullName', 0]
                    },
                    rejecterAvatar: {
                        mediaBasePath: {
                            $arrayElemAt: ['$rejecter.mediaBasePath', 0]
                        },
                        mediaUri: {
                            $arrayElemAt: ['$rejecter.mediaUri', 0]
                        },
                        mediaEndpoint: {
                            $arrayElemAt: ['$rejecter.mediaEndpoint', 0]
                        },
                    }
                },
            }
        );
        if (skip > 0) {
            pipeline.push({ $skip: skip });
        }
        if (limit > 0) {
            pipeline.push({ $limit: limit });
        }
        let data = await this.guidelineModel.aggregate(pipeline);
        return data;
    }
}